import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { QuizQuestionsRepository } from '../../../db/repositories/quiz-questions.repository';
import { AssignmentsRepository } from '../../../db/repositories/assignments.repository';
import type { QuizQuestion, Assignment } from '../../../db/schema';

export interface McqAnswer {
  [questionId: number]: number; // questionId -> selected option index
}

export interface AutoGradeResult {
  score: number;
  maxScore: number;
  details: Array<{
    questionId: number;
    correct: boolean;
    points: number;
    earnedPoints: number;
  }>;
}

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private readonly quizQuestionsRepo: QuizQuestionsRepository,
    private readonly assignmentsRepo: AssignmentsRepository,
  ) {}

  // ─── Question CRUD ─────────────────────────────────────────────────────

  /**
   * Add a question to an assignment (MCQ only).
   */
  async addQuestion(
    assignmentId: number,
    userId: number,
    userRole: string,
    data: {
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      points?: number;
      orderIndex?: number;
    },
  ): Promise<QuizQuestion> {
    this.assertCanManage(userRole);

    const assignment = await this.validateMcqAssignment(assignmentId);
    this.validateOptions(data.options, data.correctOptionIndex);

    const question = await this.quizQuestionsRepo.create({
      assignmentId,
      questionText: data.questionText,
      options: JSON.stringify(data.options),
      correctOptionIndex: data.correctOptionIndex,
      points: data.points ?? 1,
      orderIndex: data.orderIndex ?? 0,
    });

    this.logger.log(`Quiz question added: ${question.id} to assignment ${assignmentId}`);
    return question;
  }

  /**
   * Add multiple questions to an assignment (MCQ only).
   */
  async addQuestions(
    assignmentId: number,
    userId: number,
    userRole: string,
    questions: Array<{
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      points?: number;
      orderIndex?: number;
    }>,
  ): Promise<QuizQuestion[]> {
    this.assertCanManage(userRole);
    await this.validateMcqAssignment(assignmentId);

    const items = questions.map((q, index) => {
      this.validateOptions(q.options, q.correctOptionIndex);
      return {
        assignmentId,
        questionText: q.questionText,
        options: JSON.stringify(q.options),
        correctOptionIndex: q.correctOptionIndex,
        points: q.points ?? 1,
        orderIndex: q.orderIndex ?? index,
      };
    });

    const created = await this.quizQuestionsRepo.createMany(items);
    this.logger.log(`Added ${created.length} questions to assignment ${assignmentId}`);
    return created;
  }

  /**
   * Get all questions for an assignment.
   * For students: hides correctOptionIndex.
   */
  async getQuestions(
    assignmentId: number,
    includeAnswers: boolean = false,
  ): Promise<Array<QuizQuestion & { options: string[] }>> {
    const assignment = await this.assignmentsRepo.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    if (assignment.type !== 'mcq') {
      throw new BadRequestException('This assignment is not a quiz.');
    }

    const questions = await this.quizQuestionsRepo.findByAssignmentId(assignmentId);

    return questions.map((q) => {
      const parsed = {
        ...q,
        options: JSON.parse(q.options) as string[],
      };

      // Hide correct answer from students
      if (!includeAnswers) {
        return { ...parsed, correctOptionIndex: -1 } as any;
      }

      return parsed;
    });
  }

  /**
   * Update a quiz question.
   */
  async updateQuestion(
    questionId: number,
    userId: number,
    userRole: string,
    data: {
      questionText?: string;
      options?: string[];
      correctOptionIndex?: number;
      points?: number;
      orderIndex?: number;
    },
  ): Promise<QuizQuestion> {
    this.assertCanManage(userRole);

    const question = await this.quizQuestionsRepo.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    // Validate options if provided
    if (data.options || data.correctOptionIndex !== undefined) {
      const options = data.options ?? JSON.parse(question.options);
      const correctIndex = data.correctOptionIndex ?? question.correctOptionIndex;
      this.validateOptions(options, correctIndex);
    }

    const updateData: any = {};
    if (data.questionText !== undefined) updateData.questionText = data.questionText;
    if (data.options !== undefined) updateData.options = JSON.stringify(data.options);
    if (data.correctOptionIndex !== undefined) updateData.correctOptionIndex = data.correctOptionIndex;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;

    const updated = await this.quizQuestionsRepo.update(questionId, updateData);
    if (!updated) {
      throw new NotFoundException('Question not found after update.');
    }

    return updated;
  }

  /**
   * Delete a quiz question.
   */
  async deleteQuestion(questionId: number, userId: number, userRole: string): Promise<void> {
    this.assertCanManage(userRole);

    const question = await this.quizQuestionsRepo.findById(questionId);
    if (!question) {
      throw new NotFoundException('Question not found.');
    }

    const deleted = await this.quizQuestionsRepo.delete(questionId);
    if (!deleted) {
      throw new NotFoundException('Question not found for deletion.');
    }

    this.logger.log(`Quiz question deleted: ${questionId}`);
  }

  // ─── Auto-Grading Engine ──────────────────────────────────────────────

  /**
   * Auto-grade an MCQ submission.
   * Answers are expected as JSON: { "questionId": selectedOptionIndex, ... }
   */
  async autoGradeMcq(assignmentId: number, answersJson: string): Promise<AutoGradeResult> {
    const assignment = await this.assignmentsRepo.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    if (assignment.type !== 'mcq') {
      throw new BadRequestException('Auto-grading is only available for MCQ assignments.');
    }

    // Parse answers
    let answers: McqAnswer;
    try {
      answers = JSON.parse(answersJson);
    } catch {
      throw new BadRequestException('Invalid answer format. Expected JSON object.');
    }

    // Get all questions
    const questions = await this.quizQuestionsRepo.findByAssignmentId(assignmentId);

    if (questions.length === 0) {
      throw new BadRequestException('No questions found for this quiz.');
    }

    let totalEarned = 0;
    let totalPossible = 0;
    const details: AutoGradeResult['details'] = [];

    for (const question of questions) {
      const selectedAnswer = answers[question.id];
      const isCorrect = selectedAnswer === question.correctOptionIndex;
      const earned = isCorrect ? question.points : 0;

      totalEarned += earned;
      totalPossible += question.points;

      details.push({
        questionId: question.id,
        correct: isCorrect,
        points: question.points,
        earnedPoints: earned,
      });
    }

    // Scale score to assignment's maxScore
    const scaledScore = totalPossible > 0
      ? Math.round((totalEarned / totalPossible) * assignment.maxScore)
      : 0;

    this.logger.log(
      `Auto-graded assignment ${assignmentId}: ${totalEarned}/${totalPossible} raw, ${scaledScore}/${assignment.maxScore} scaled`,
    );

    return {
      score: scaledScore,
      maxScore: assignment.maxScore,
      details,
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  private async validateMcqAssignment(assignmentId: number): Promise<Assignment> {
    const assignment = await this.assignmentsRepo.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }
    if (assignment.type !== 'mcq') {
      throw new BadRequestException('Questions can only be added to MCQ assignments.');
    }
    return assignment;
  }

  private validateOptions(options: string[], correctOptionIndex: number): void {
    if (!options || options.length < 2) {
      throw new BadRequestException('At least 2 options are required.');
    }
    if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
      throw new BadRequestException(
        `Correct option index must be between 0 and ${options.length - 1}.`,
      );
    }
  }

  private assertCanManage(userRole: string): void {
    if (userRole !== 'instructor' && userRole !== 'admin') {
      throw new ForbiddenException('Only instructors and admins can manage quiz questions.');
    }
  }
}

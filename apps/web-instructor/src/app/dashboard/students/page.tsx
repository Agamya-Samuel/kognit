'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Search, Mail } from 'lucide-react';
import { Spinner } from '@edutech/ui';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [isLoading] = useState(false);

  const students = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', course: 'TypeScript Basics', enrolledAt: '2024-01-15', progress: 75 },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', course: 'React Patterns', enrolledAt: '2024-01-10', progress: 90 },
    { id: 3, name: 'Mike Johnson', email: 'mike.j@example.com', course: 'TypeScript Basics', enrolledAt: '2024-01-20', progress: 45 },
    { id: 4, name: 'Emily Brown', email: 'emily.b@example.com', course: 'Node.js Fundamentals', enrolledAt: '2024-01-08', progress: 100 },
    { id: 5, name: 'David Lee', email: 'david.l@example.com', course: 'React Patterns', enrolledAt: '2024-01-12', progress: 60 },
  ];

  const filteredStudents = students.filter(
    (student) =>
      (selectedCourse === 'all' || student.course === selectedCourse) &&
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Students</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your students and track their progress
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Students</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Courses</option>
                <option value="TypeScript Basics">TypeScript Basics</option>
                <option value="React Patterns">React Patterns</option>
                <option value="Node.js Fundamentals">Node.js Fundamentals</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Course</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Enrolled</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Progress</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{student.course}</td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.progress >= 90 ? 'bg-green-500' : student.progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 w-12 text-right">
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">No students found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
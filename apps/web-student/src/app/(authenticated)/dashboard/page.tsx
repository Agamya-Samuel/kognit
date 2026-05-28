'use client';

import { useState, useEffect } from 'react';
import { StudentDashboard } from '@edutech/shared-components';
import { useAuth } from '@edutech/shared-components';
import { useMyEnrollments } from '@/hooks/useEnrollments';
import { useCourseProgress } from '@/hooks/useEnrollments';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { useNotifications } from '@/hooks/useNotifications';
import { useMyCertificates } from '@/hooks/useCertificates';
import { useWatchSummary } from '@/hooks/useWatchSummary';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: enrollments, isLoading: enrollmentsLoading } = useMyEnrollments();
  const { data: notifications, isLoading: notificationsLoading } = useNotifications({ isRead: false });
  const { data: certificates, isLoading: certificatesLoading } = useMyCertificates();
  const { data: watchTime, isLoading: watchTimeLoading } = useWatchSummary();
  
  // Calculate metrics from enrollments and other data
  const [metrics, setMetrics] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    watchTime: 0,
    certificates: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [inProgressCourses, setInProgressCourses] = useState([]);
  
  useEffect(() => {
    if (enrollments) {
      const enrolledCourses = enrollments.length;
      const completedCourses = enrollments.filter(e => e.progress === 100).length;
      
      // Calculate total watch time from progress tracking
      let totalWatchTime = 0;
      const inProgress = [];
      const activity = [];
      
      enrollments.forEach(enrollment => {
        // Add to in progress if not completed
        if (enrollment.progress > 0 && enrollment.progress < 100) {
          inProgress.push({
            id: enrollment.courseId.toString(),
            title: enrollment.courseTitle,
            instructor: enrollment.instructorName,
            progress: enrollment.progress,
            lastWatched: 'Recently', // Would ideally come from progress tracking
          });
        }
        
        // Add to recent activity based on enrollment date
        activity.push({
          id: enrollment.id.toString(),
          message: `Enrolled in "${enrollment.courseTitle}"`,
          time: new Date(enrollment.enrolledAt).toLocaleDateString(undefined, { 
            year: 'numeric', month: 'short', day: 'numeric' 
          }),
          status: 'info'
        });
        
        // If completed, add completion activity
        if (enrollment.progress === 100) {
          activity.push({
            id: `${enrollment.id}-completed`,
            message: `Completed "${enrollment.courseTitle}"`,
            time: new Date(enrollment.enrolledAt).toLocaleDateString(undefined, { 
              year: 'numeric', month: 'short', day: 'numeric' 
            }),
            status: 'success'
          });
        }
      });
      
      // Sort activity by date (newest first) and take top 3
      const sortedActivity = activity
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 3);
      
      // Get unread notifications for activity
      const notificationActivity = (notifications || [])
        .map(notif => ({
          id: notif.id.toString(),
          message: notif.title,
          time: new Date(notif.createdAt).toLocaleDateString(undefined, { 
            year: 'numeric', month: 'short', day: 'numeric' 
          }),
          status: notif.isRead ? 'info' : 'success'
        }))
        .slice(0, 2);
      
      setMetrics({
        enrolledCourses,
        completedCourses,
        watchTime: watchTime?.totalWatchedSeconds || 0, // Use actual watch time from API
        certificates: certificates?.total || 0 // Actual certificate count from API
      });
      
      setRecentActivity([...sortedActivity, ...notificationActivity].slice(0, 3));
      setInProgressCourses(inProgress.slice(0, 2)); // Show top 2 in progress
    }
  }, [enrollments, notifications, certificates, watchTime]);
   
    if (enrollmentsLoading || certificatesLoading || watchTimeLoading) {
      return (
        <StudentDashboard
          metrics={{
            enrolledCourses: 0,
            completedCourses: 0,
            watchTime: 0,
            certificates: 0,
          }}
          metricsLoading={true}
          recentActivity={[]}
          inProgressCourses={[]}
        />
      );
    }
   
  return (
    <StudentDashboard
      metrics={metrics}
      recentActivity={recentActivity}
      inProgressCourses={inProgressCourses}
    />
  );
}
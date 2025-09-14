'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourseList from '@/components/courses/CourseList';
import CourseBuilder from '@/components/courses/CourseBuilder';

interface Course {
  id?: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  thumbnail?: string;
  modules: CourseModule[];
}

interface CourseModule {
  id?: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id?: string;
  title: string;
  content: {
    type: 'video' | 'text' | 'quiz' | 'exercise';
    data: any;
  };
  duration: number;
  order: number;
}

export default function CourseManagePage() {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication and role
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/auth/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'trainer') {
        router.push('/dashboard');
        return;
      }
      
      setUserRole(userData.role);
      setIsAuthenticated(true);
    } catch (error) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleCreateNew = () => {
    setEditingCourse(null);
    setCurrentView('create');
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setCurrentView('edit');
  };

  const handleSaveCourse = async (course: Course) => {
    try {
      const token = localStorage.getItem('token');
      const isEditing = editingCourse && editingCourse.id;
      
      const url = isEditing ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(course),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save course');
      }

      const savedCourse = await response.json();

      // If we have modules and lessons, save them too
      if (course.modules.length > 0) {
        await saveModulesAndLessons(savedCourse.id, course.modules);
      }

      setCurrentView('list');
      setEditingCourse(null);
    } catch (error) {
      console.error('Failed to save course:', error);
      throw error;
    }
  };

  const saveModulesAndLessons = async (courseId: string, modules: CourseModule[]) => {
    const token = localStorage.getItem('token');

    for (const module of modules) {
      try {
        // Save or update module
        const moduleResponse = await fetch(`/api/courses/${courseId}/modules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: module.title,
            order: module.order,
          }),
        });

        if (!moduleResponse.ok) {
          throw new Error('Failed to save module');
        }

        const savedModule = await moduleResponse.json();

        // Save lessons for this module
        for (const lesson of module.lessons) {
          await fetch(`/api/courses/${courseId}/modules/${savedModule.id}/lessons`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: lesson.title,
              content: lesson.content,
              duration: lesson.duration,
              order: lesson.order,
            }),
          });
        }
      } catch (error) {
        console.error('Failed to save module or lessons:', error);
      }
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingCourse(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (userRole !== 'trainer') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">Only trainers can access course management.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentView === 'list' && (
          <CourseList
            onCreateNew={handleCreateNew}
            onEditCourse={handleEditCourse}
          />
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <CourseBuilder
            initialCourse={editingCourse || undefined}
            onSave={handleSaveCourse}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
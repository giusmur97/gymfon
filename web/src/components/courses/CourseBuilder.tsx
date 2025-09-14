'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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

interface CourseBuilderProps {
  initialCourse?: Course;
  onSave: (course: Course) => Promise<void>;
  onCancel: () => void;
}

export default function CourseBuilder({ initialCourse, onSave, onCancel }: CourseBuilderProps) {
  const [course, setCourse] = useState<Course>(initialCourse || {
    title: '',
    description: '',
    price: 0,
    duration: 1,
    difficulty: 'beginner',
    tags: [],
    modules: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCourse = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!course.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!course.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (course.price < 0) {
      newErrors.price = 'Price must be positive';
    }
    if (course.duration < 1 || course.duration > 52) {
      newErrors.duration = 'Duration must be between 1 and 52 weeks';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [course]);

  const handleSave = async () => {
    if (!validateCourse()) return;

    setIsLoading(true);
    try {
      await onSave(course);
    } catch (error) {
      console.error('Failed to save course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addModule = () => {
    const newModule: CourseModule = {
      title: `Module ${course.modules.length + 1}`,
      order: course.modules.length,
      lessons: []
    };
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const updateModule = (moduleIndex: number, updates: Partial<CourseModule>) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex ? { ...module, ...updates } : module
      )
    }));
  };

  const deleteModule = (moduleIndex: number) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== moduleIndex)
    }));
  };

  const addLesson = (moduleIndex: number) => {
    const module = course.modules[moduleIndex];
    const newLesson: Lesson = {
      title: `Lesson ${module.lessons.length + 1}`,
      content: { type: 'video', data: {} },
      duration: 10,
      order: module.lessons.length
    };

    updateModule(moduleIndex, {
      lessons: [...module.lessons, newLesson]
    });
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, updates: Partial<Lesson>) => {
    const module = course.modules[moduleIndex];
    const updatedLessons = module.lessons.map((lesson, index) =>
      index === lessonIndex ? { ...lesson, ...updates } : lesson
    );
    updateModule(moduleIndex, { lessons: updatedLessons });
  };

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const module = course.modules[moduleIndex];
    const updatedLessons = module.lessons.filter((_, index) => index !== lessonIndex);
    updateModule(moduleIndex, { lessons: updatedLessons });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'module') {
      const newModules = Array.from(course.modules);
      const [reorderedModule] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, reorderedModule);

      // Update order values
      const updatedModules = newModules.map((module, index) => ({
        ...module,
        order: index
      }));

      setCourse(prev => ({ ...prev, modules: updatedModules }));
    } else if (type === 'lesson') {
      const moduleIndex = parseInt(source.droppableId.split('-')[1]);
      const module = course.modules[moduleIndex];
      const newLessons = Array.from(module.lessons);
      const [reorderedLesson] = newLessons.splice(source.index, 1);
      newLessons.splice(destination.index, 0, reorderedLesson);

      // Update order values
      const updatedLessons = newLessons.map((lesson, index) => ({
        ...lesson,
        order: index
      }));

      updateModule(moduleIndex, { lessons: updatedLessons });
    }
  };

  const addTag = (tag: string) => {
    if (tag && !course.tags.includes(tag)) {
      setCourse(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCourse(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {initialCourse ? 'Edit Course' : 'Create New Course'}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </div>

      {/* Course Basic Information */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Course Title
          </label>
          <input
            type="text"
            value={course.title}
            onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Enter course title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={course.description}
            onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Describe your course"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={course.price}
              onChange={(e) => setCourse(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (weeks)
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={course.duration}
              onChange={(e) => setCourse(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={course.difficulty}
              onChange={(e) => setCourse(prev => ({ ...prev, difficulty: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {course.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add a tag and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(e.currentTarget.value.trim());
                e.currentTarget.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Course Modules */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Course Modules</h2>
          <button
            onClick={addModule}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Module
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="modules" type="module">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <Draggable key={moduleIndex} draggableId={`module-${moduleIndex}`} index={moduleIndex}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div {...provided.dragHandleProps} className="cursor-move text-gray-400">
                            ⋮⋮
                          </div>
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) => updateModule(moduleIndex, { title: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Module title"
                          />
                          <button
                            onClick={() => addLesson(moduleIndex)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            Add Lesson
                          </button>
                          <button
                            onClick={() => deleteModule(moduleIndex)}
                            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>

                        <Droppable droppableId={`lessons-${moduleIndex}`} type="lesson">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 ml-6">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <Draggable key={lessonIndex} draggableId={`lesson-${moduleIndex}-${lessonIndex}`} index={lessonIndex}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                                    >
                                      <div {...provided.dragHandleProps} className="cursor-move text-gray-400">
                                        ⋮⋮
                                      </div>
                                      <input
                                        type="text"
                                        value={lesson.title}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })}
                                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="Lesson title"
                                      />
                                      <select
                                        value={lesson.content.type}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, { 
                                          content: { ...lesson.content, type: e.target.value as any }
                                        })}
                                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      >
                                        <option value="video">Video</option>
                                        <option value="text">Text</option>
                                        <option value="quiz">Quiz</option>
                                        <option value="exercise">Exercise</option>
                                      </select>
                                      <input
                                        type="number"
                                        min="1"
                                        value={lesson.duration}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, { duration: parseInt(e.target.value) || 1 })}
                                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        placeholder="Min"
                                      />
                                      <button
                                        onClick={() => deleteLesson(moduleIndex, lessonIndex)}
                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
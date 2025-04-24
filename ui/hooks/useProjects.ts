import { useState, useEffect } from "react";
import { graphqlClient } from "@/lib/graphql/client";
import {
  GET_PROJECTS,
  GET_PROJECT,
  CREATE_PROJECT,
  CREATE_PROJECT_UPDATE,
  CREATE_COMMENT,
  CREATE_CONTRIBUTION,
} from "@/lib/graphql/queries";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  goal: number;
  raised: number;
  backers: number;
  daysLeft: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    username?: string;
    avatarUrl?: string;
  };
  updates: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username?: string;
      avatarUrl?: string;
    };
    replyToComment?: {
      id: string;
      content: string;
      user: {
        id: string;
        username?: string;
        avatarUrl?: string;
      };
    };
  }>;
  contributions: Array<{
    id: string;
    amount: number;
    createdAt: string;
    user: {
      id: string;
      username?: string;
      avatarUrl?: string;
    };
  }>;
}

interface UseProjectsOptions {
  category?: string;
  creatorId?: string;
  first?: number;
  skip?: number;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { projects } = await graphqlClient.request(GET_PROJECTS, options);
        setProjects(projects);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch projects"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [options]);

  const getProject = async (id: string) => {
    try {
      const { project } = await graphqlClient.request(GET_PROJECT, { id });
      return project;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to fetch project"
      );
    }
  };

  const createProject = async (projectData: {
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
    goal: number;
    daysLeft: number;
  }) => {
    try {
      const { createProject } = await graphqlClient.request(
        CREATE_PROJECT,
        projectData
      );
      return createProject;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create project"
      );
    }
  };

  const createProjectUpdate = async (updateData: {
    projectId: string;
    title: string;
    content: string;
  }) => {
    try {
      const { createProjectUpdate } = await graphqlClient.request(
        CREATE_PROJECT_UPDATE,
        updateData
      );
      return createProjectUpdate;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create project update"
      );
    }
  };

  const createComment = async (commentData: {
    projectId: string;
    content: string;
    replyTo?: string;
  }) => {
    try {
      const { createComment } = await graphqlClient.request(
        CREATE_COMMENT,
        commentData
      );
      return createComment;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create comment"
      );
    }
  };

  const createContribution = async (contributionData: {
    projectId: string;
    amount: number;
  }) => {
    try {
      const { createContribution } = await graphqlClient.request(
        CREATE_CONTRIBUTION,
        contributionData
      );
      return createContribution;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create contribution"
      );
    }
  };

  return {
    projects,
    isLoading,
    error,
    getProject,
    createProject,
    createProjectUpdate,
    createComment,
    createContribution,
  };
}

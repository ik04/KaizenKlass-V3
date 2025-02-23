interface Subject {
  subject: string;
  subject_uuid: string;
}
interface Assignment {
  title: string;
  assignment_uuid: string;
  subject: string;
  subject_uuid: string;
  deadline?: string;
  description?: string;
  content?: string;
  link: string;
}
interface AssignmentWithDeadline {
  title: string;
  subject_uuid: string;
  assignment_uuid: string;
  deadline: string;
  subject: string;
}
interface Solution {
  content: string;
  solution_uuid: string;
  description: string;
  username: string;
  user_uuid: string;
}

interface Subject {
  subject: string;
  subject_uuid: string;
}

interface GlobalContextValue {
  isAuthenticated: boolean;
  role: number;
  email: string;
  username: string;
  userUuid: string;
  isSidebarExpanded: boolean;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isAdmin: boolean;
  hasEditPrivileges: boolean;
  isOnBoard: number;
}

interface Resource {
  title: string;
  description?: string;
  link: string;
  type: number;
}
interface Test {
  title: string;
  exam_date?: string;
  test_uuid: string;
  subject_uuid: string;
  subject: string;
}
interface TestResource {
  content: string;
  test_resource_uuid: string;
  description: string;
  username: string;
  user_uuid: string;
}
interface SubjectResource {
  content: string;
  subject_resource_uuid: string;
  name: string;
  title: string;
  user_uuid: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface TestsResponse {
  tests: {
    current_page: number;
    data: Test[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

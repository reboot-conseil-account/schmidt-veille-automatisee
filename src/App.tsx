import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { TopicsPage } from "@/pages/TopicsPage";
import { TopicFormPage } from "@/pages/TopicFormPage";
import { DigestHistoryPage } from "@/pages/DigestHistoryPage";
import { MailingListsPage } from "@/pages/MailingListsPage";
import { TechStackPage } from "@/pages/TechStackPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/topics" replace />,
  },
  {
    path: "/topics",
    element: (
      <AppShell>
        <TopicsPage />
      </AppShell>
    ),
  },
  {
    path: "/topics/new",
    element: (
      <AppShell>
        <TopicFormPage />
      </AppShell>
    ),
  },
  {
    path: "/topics/:id",
    element: (
      <AppShell>
        <TopicFormPage />
      </AppShell>
    ),
  },
  {
    path: "/history",
    element: (
      <AppShell>
        <DigestHistoryPage />
      </AppShell>
    ),
  },
  {
    path: "/mailing-lists",
    element: (
      <AppShell>
        <MailingListsPage />
      </AppShell>
    ),
  },
  {
    path: "/tech-stack",
    element: (
      <AppShell>
        <TechStackPage />
      </AppShell>
    ),
  },
]);

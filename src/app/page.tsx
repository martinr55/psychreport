import { AssessmentWorkspace } from "@/components/assessment/AssessmentWorkspace";
import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return (
    <AppShell>
      <AssessmentWorkspace />
    </AppShell>
  );
}

import { AppShell } from "@/components/app-shell";
import { CommandCenter } from "@/components/command-center";

export default function HomePage() {
  return (
    <AppShell>
      <CommandCenter />
    </AppShell>
  );
}

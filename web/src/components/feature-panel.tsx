import { Crab } from "@/components/crab";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type FeaturePanelProps = {
  title: string;
  heading?: "h1" | "h2";
  text: string;
  children: React.ReactNode;
};

// For screens without content yet: the dashed frame says "nothing here" honestly.
export function FeaturePanel({ title, heading: Heading = "h1", text, children }: FeaturePanelProps) {
  return (
    <Empty className="glass rounded-[26px]">
      <EmptyHeader>
        <EmptyMedia>
          <Crab size={72} />
        </EmptyMedia>
        <EmptyTitle>
          <Heading className="text-xl font-semibold tracking-tight">{title}</Heading>
        </EmptyTitle>
        <EmptyDescription className="text-base">{text}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{children}</EmptyContent>
    </Empty>
  );
}

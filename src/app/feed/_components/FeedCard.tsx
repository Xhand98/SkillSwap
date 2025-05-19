import { Text } from "@/components/text";
import { User } from "lucide-react";

interface FeedCardProps {
  title: string;
  description: string;
  tags: string[];
  author: string;
}

const FeedCard: React.FC<FeedCardProps> = ({
  title,
  description,
  tags,
  author,
}) => (
  <div className="bg-[#2a2a2a] w-[80%] shadow-sm overflow-hidden">
    <div className="p-4 space-y-2">
      <Text as={"h3"} size="heading-3" className="font-bold text-primary">
        {title}
      </Text>
      <Text size="paragraph-sm" className="text-gray-200">
        {description}
      </Text>
      <Text
        as={"span"}
        size="paragraph-sm"
        className="flex items-center gap-2 text-gray-400"
      >
        <User size={16} />
        <span>{author}</span>
      </Text>
    </div>
    <div className="min-w-full min-h-36" />
  </div>
);

export default FeedCard;

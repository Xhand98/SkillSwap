import { Text } from "@/components/text";
import { Heart, MessageCircle, Repeat2, Share, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FeedCardProps {
  title: string;
  description: string;
  tags: string[];
  author: string;
  createdAt?: string;
  likes?: number;
  comments?: number;
  reposts?: number;
}

const FeedCard: React.FC<FeedCardProps> = ({
  title,
  description,
  tags,
  author,
  createdAt = "2h",
  likes = Math.floor(Math.random() * 50),
  comments = Math.floor(Math.random() * 20),
  reposts = Math.floor(Math.random() * 10),
}) => (
  <article className="border-b border-gray-800 p-4 hover:bg-gray-900/50 transition-colors cursor-pointer">
    <div className="flex gap-3">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={`https://avatar.vercel.sh/${author}`} alt={author} />
        <AvatarFallback>{author[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Text className="font-bold text-white" size="paragraph-sm">
            {author}
          </Text>
          <Text className="text-gray-500" size="paragraph-xs">
            @{author.toLowerCase().replace(/\s/g, "")}
          </Text>
          <span className="text-gray-500">·</span>
          <Text className="text-gray-500" size="paragraph-xs">
            {createdAt}
          </Text>
        </div>

        <Text
          as="h3"
          size="paragraph-base"
          className="font-semibold text-white"
        >
          {title}
        </Text>

        <Text size="paragraph-sm" className="text-gray-300">
          {description}
        </Text>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="text-sm text-primary bg-primary/10 px-2 py-1 rounded-full text-bold"
              >
                #{tag.toLowerCase().replace(/\s/g, "")}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-3 text-gray-500 max-w-md">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-gray-500 hover:text-pink-500 hover:bg-pink-500/10"
          >
            <Heart size={18} />
            {likes > 0 && <span className="text-xs">{likes}</span>}
          </Button>
        </div>
      </div>
    </div>
  </article>
);

export default FeedCard;

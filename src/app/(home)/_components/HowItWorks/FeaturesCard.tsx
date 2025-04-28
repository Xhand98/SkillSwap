import React from "react";

export interface FeatureCardProps {
  title?: string;
  text?: string;
  cardEmoji?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  text,
  cardEmoji,
}) => (
  <div className="bg-[#1f1f1f] p-6 rounded-2xl shadow hover:shadow-lg transition duration-300">
    <div className="text-4xl mb-4">{cardEmoji}</div>
    <h3 className="text-xl text-white font-semibold mb-2">{title}</h3>
    <p className="text-gray-300 text-sm">{text}</p>
  </div>
);

export default FeatureCard;

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 py-10 text-center">
      <p className="text-sm font-medium leading-5 text-text-primary">{title}</p>
      <p className="text-xs font-normal leading-4 text-text-secondary">{message}</p>
    </div>
  );
}

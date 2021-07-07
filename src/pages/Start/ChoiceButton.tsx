type ChoiceButtonProps = {
  type: string;
  choice: string;
  label: string;
  onChoice: (choice: string) => void;
};
export const ChoiceButton = ({
  type,
  choice,
  label,
  onChoice,
}: ChoiceButtonProps) => (
  <button className="border rounded p-2" onClick={() => onChoice(choice)}>
    {label}
  </button>
);

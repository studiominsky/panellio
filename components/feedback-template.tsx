import { FeedbackTypes } from '@/types/feedback-types';

export const FeedbackTemplate: React.FC<Readonly<FeedbackTypes>> = ({
  message = 'No message provided.',
  emoji = 'No emoji provided.',
  name,
  email,
}) => (
  <div>
    <div>Hi, Panellio!</div>
    <div>
      <p>
        <strong>Message:</strong> {message}
      </p>
      <p>
        <strong>Emoji:</strong> {emoji}
      </p>
      {name ? (
        <p>
          <strong>From:</strong> {name}
        </p>
      ) : (
        <p>Anonymous Feedback</p>
      )}
      {email && (
        <p>
          <strong>Email:</strong> {email}
        </p>
      )}
    </div>
  </div>
);

export default FeedbackTemplate;

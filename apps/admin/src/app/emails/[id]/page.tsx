import { EmailPage } from '../../../features/email/EmailPage';

const EmailPageRoute = async (props: PageProps<'/emails/[id]'>) => {
  const { id } = await props.params;

  return <EmailPage id={Number(id)} />;
};

export default EmailPageRoute;

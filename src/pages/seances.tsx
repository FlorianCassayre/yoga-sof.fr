import ContentSeances from '../../contents/seances.mdx';
import { prisma } from '../server';

export default ContentSeances;

/*export async function getServerSideProps() {
  return {
    props: {
      courseModels: await prisma.courseModel.findMany(),
    },
  };
}*/

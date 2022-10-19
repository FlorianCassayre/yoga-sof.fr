interface BreadcrumbTree {
  title: string;
  children?: Record<string, BreadcrumbTree>;
}

const BreadcrumbTree = {
  title: 'Yoga Sof',
  children: {
    Dashboard: {
      title: 'Aperçu',
    }
  }
};

interface Breadcrumb {

}

const makeBreadcrumbs = <T extends BreadcrumbTree>(tree: T): any & Breadcrumb => {

};

export const Breadcrumb: any = 0;

/*type TreeValue<P> = {
  f: (param: P) => string;
};

type TreeNode<T extends TreeNode= any> = {
  [K in string & (keyof T)]: (K extends 'value' ? TreeValue<Parameters<T[K]['f']>[0]> & T[K] : TreeNode<T[K]>);
};

const make = <T extends TreeNode<T>>(t: T): T => t;

const Root = make({
  value: {
    title: 'Yoga Sof',
    url: '/administration',
  },
  Preview: {
    value: {
      title: 'Yoga Sof',
      url: '/administration',
    }
  }
});*/

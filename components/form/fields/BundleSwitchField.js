import { SwitchField } from './SwitchField';

export function BundleSwitchField({ value, ...props }) {
  return (
    <SwitchField
      mainLabel="S'agit-il d'un modèle pour des séances à inscription par lot ?"
      label={value ? 'Oui : les inscriptions devront nécessairement se faire sur le lot entier' : `Non : les séances pourront être choisies individuellement`}
      muted={value && `Dans ce cas, le prix renseigné plus haut correspond au prix total du lot de séances`}
      {...props}
    />
  );
}

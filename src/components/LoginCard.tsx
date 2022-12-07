import React, { Fragment } from 'react';

import { getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { AuthProviders } from '../common/providers';
import { EMAIL_CONTACT } from '../common/config';
import { BuiltInProviderType } from 'next-auth/providers';
import { ClientSafeProvider, LiteralUnion, SignInOptions } from 'next-auth/react/types';
import { Alert, Button, Card, CardContent, Divider, Stack, Typography, Link as MuiLink } from '@mui/material';
import { useAsyncFn } from 'react-use';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ErrorMessages: Record<string, string> = {
  Verification: 'Le lien que vous avez suivi est probablement périmé.',
  OAuthAccountNotLinked: 'Il semble que vous vous vous soyez déjà connecté depuis un autre service. Merci de réutiliser ce service pour vous connecter.',
  AccessDenied: `Votre compte a été désactivé par un administrateur, si vous pensez qu'il s'agit d'une erreur merci de nous écrire.`,
};

interface LoginCardLayoutProps {
  title: string;
  error?: string;
  onErrorClose: () => void;
  description: string;
  separator: string;
  forms: React.ReactNode[][];
  footer: React.ReactNode;
}

export const LoginCardLayout: React.FC<LoginCardLayoutProps> = ({ title, error, onErrorClose, description, separator, forms, footer }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" component="div" textAlign="center" sx={{ mb: 2 }}>
          {title}
        </Typography>
        {!!error && (
          <Alert severity="error" onClose={onErrorClose} sx={{ mb: 1 }}>{error}</Alert>
        )}
        <Typography paragraph>
          {description}
        </Typography>
        {forms.map((formArray, i) => (
          <Fragment key={i}>
            <Stack direction="column" gap={1}>
              {formArray.map((form, j) => (
                <Fragment key={j}>
                  {form}
                </Fragment>
              ))}
            </Stack>
            {i < forms.length - 1 && (
              <Divider sx={{ my: 2 }}>{separator}</Divider>
            )}
          </Fragment>
        ))}
        <Typography paragraph sx={{ mt: 2, mb: 0 }}>
          {footer}
        </Typography>
      </CardContent>
    </Card>
  );
};

interface ProviderLoginProps {
  provider: ClientSafeProvider;
  disabled: boolean;
  callback: (providerId: LiteralUnion<BuiltInProviderType>, data?: SignInOptions) => void;
}

const ExternalProviderLogin: React.FC<ProviderLoginProps> = ({ provider, disabled, callback }) => {
  const { name, icon, color, variant } = AuthProviders[provider.id] ?? AuthProviders.fallback;
  return (
    <Button variant={variant} startIcon={icon} color={color} disabled={disabled} onClick={() => callback(provider.id)}>
      Se connecter avec {name}
    </Button>
  );
};

const EmailProvider: React.FC<ProviderLoginProps> = ({ provider, disabled, callback }) => {
  const { icon, color, variant } = AuthProviders[provider.id] ?? AuthProviders.fallback;
  return (
    <FormContainer
      defaultValues={{ email: '' }}
      resolver={zodResolver(z.strictObject({ email: z.string().email(`Veuillez entrer une adresse e-mail valide`) }))}
      onSuccess={({ email }) => callback(provider.id, { email })}
    >
      <Stack direction="column" gap={1}>
        <TextFieldElement name="email" label="Addresse e-mail" disabled={disabled} fullWidth />
        <Button type="submit" variant={variant} startIcon={icon} color={color} disabled={disabled} fullWidth>
          Recevoir un lien de connexion
        </Button>
      </Stack>
    </FormContainer>
  );
};

interface LoginCardProps {
  providers: NonNullable<Awaited<ReturnType<typeof getProviders>>>;
}

export const LoginCard: React.FC<LoginCardProps> = ({ providers }) => {
  const emailKey = 'email';

  const router = useRouter();
  const { error } = router.query;

  const [{ loading }, callback] = useAsyncFn((providerId: LiteralUnion<BuiltInProviderType>, data?: SignInOptions) =>
    signIn(providerId, { callbackUrl: `${window.location.origin}/redirection`, ...data }), []);

  const handleClearErrors = () => router.replace('/connexion', undefined, { shallow: true });

  return (
    <LoginCardLayout
      title="Connexion à Yoga Sof"
      error={error ? ErrorMessages[String(error)] ?? 'Une erreur est survenue.' : undefined}
      onErrorClose={handleClearErrors}
      description="Merci d'utiliser l'un des services ci-dessous pour vous inscrire ou vous connecter."
      separator="OU"
      forms={[
        Object.values(providers).filter(provider => provider.id !== emailKey).map((provider) => (
          <ExternalProviderLogin key={provider.id} provider={provider} disabled={loading} callback={callback} />
        )),
        Object.values(providers).filter(provider => provider.id === emailKey).map((provider) => (
          <EmailProvider key={provider.id} provider={provider} disabled={loading} callback={callback} />
        )),
      ]}
      footer={(
        <>
          En cas de problème, n'hésitez pas à <MuiLink href={`mailto:${EMAIL_CONTACT}`}>nous contacter</MuiLink>.
        </>
      )}
    />
  );
}

import { useTranslation } from 'react-i18next';

export default function TranslatedText({ 
  children, 
  fallback = null,
  ...props 
}) {
  const { t, ready } = useTranslation();

  if (!ready) {
    return fallback || children;
  }

  return t(children, props);
}
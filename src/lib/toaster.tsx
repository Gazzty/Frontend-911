import { Stack, Toast, Toaster as ChakraToaster, createToaster } from '@chakra-ui/react';

export const toaster = createToaster({ placement: 'top', duration: 3000, gap: 12 });

export const Toaster = () => (
  <ChakraToaster toaster={toaster}>
    {(toast) => (
      <Toast.Root
        key={toast.id}
        width="sm"
        p={5}
        css={{
          '&[data-type=success]': { bg: 'green.100', color: 'green.800' },
          '&[data-type=error]': { bg: 'red.100', color: 'red.800' },
          '&[data-type=warning]': { bg: 'orange.100', color: 'orange.800' },
          '&[data-type=info]': { bg: 'blue.100', color: 'blue.800' },
        }}
      >
        <Toast.Indicator />
        <Stack gap="1" flex="1" maxWidth="100%">
          {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
          {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
        </Stack>
        <Toast.CloseTrigger />
      </Toast.Root>
    )}
  </ChakraToaster>
);

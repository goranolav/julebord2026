import { useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useBlocker } from 'react-router-dom';
import { no } from '../i18n/no';

/**
 * Warns before leaving a page with unsaved changes: an in-app dialog for navigation
 * inside the app, and the browser's own prompt when closing or reloading the tab.
 */
export default function UnsavedChangesGuard({ when }: { when: boolean }) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!when) return undefined;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Required by some browsers to show the prompt.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);

  const blocked = blocker.state === 'blocked';
  return (
    <Dialog open={blocked} onClose={() => blocker.reset?.()}>
      <DialogTitle>{no.editor.leaveTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>{no.editor.leaveText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => blocker.reset?.()} autoFocus>
          {no.editor.stay}
        </Button>
        <Button variant="contained" color="error" onClick={() => blocker.proceed?.()}>
          {no.editor.leave}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

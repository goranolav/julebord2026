import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { no } from '../i18n/no';
import { onStorageError } from '../storage/safeStorage';

/** Tells the user when saving to the browser failed (e.g. storage full). */
export default function StorageErrorNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => onStorageError(() => setOpen(true)), []);

  return (
    <Snackbar open={open} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity="error" variant="filled" onClose={() => setOpen(false)}>
        {no.storage.writeFailed}
      </Alert>
    </Snackbar>
  );
}

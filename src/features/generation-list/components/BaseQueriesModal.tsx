import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

interface BaseQueriesModalProps {
  open: boolean;
  onClose: () => void;
  queries: string[];
}

export const BaseQueriesModal = ({ open, onClose, queries }: BaseQueriesModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Base Queries</DialogTitle>
      <DialogContent dividers>
        {queries.length === 0 ? (
          <Typography variant="body2">No base queries</Typography>
        ) : (
          <List dense>
            {queries.map((text, index) => (
              <ListItem key={index}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};


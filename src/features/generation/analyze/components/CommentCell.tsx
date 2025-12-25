import type { KeyboardEvent, MouseEvent, SyntheticEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import { Box, IconButton, Popover, Stack, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { commentStore, CommentEntry } from '../stores/commentStore';
import { PALETTE_COLORS } from './palette';

type CommentCellProps = {
  rowId: string;
  width?: number;
};

export const CommentCell = observer(({ rowId, width = 220 }: CommentCellProps) => {
  const entry = commentStore.getEntry(rowId);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [draft, setDraft] = useState(entry?.text ?? '');
  const currentColor = entry?.color ?? null;
  const iconRef = useRef<HTMLButtonElement | null>(null);
  const [iconRect, setIconRect] = useState<DOMRect | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setDraft(entry?.text ?? '');
  }, [entry?.text]);

  const openPopover = (target: HTMLButtonElement) => {
    setAnchorEl((prev) => (prev ? null : target));
    setIconRect(target.getBoundingClientRect());
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleIconClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openPopover(event.currentTarget);
  };

  const handleClose = (event?: SyntheticEvent) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const paletteOpen = Boolean(anchorEl);

  const handleColorSelect = (selected: string | null) => {
    const updated: CommentEntry = {
      text: draft,
      color: selected,
    };
    if (!selected && !draft.trim()) {
      commentStore.removeEntry(rowId);
    } else {
      commentStore.setEntry(rowId, updated);
    }
    setAnchorEl(null);
  };

  const handleSaveText = () => {
    const updated = {
      text: draft,
      color: entry?.color ?? null,
    };
    if (!draft.trim() && !updated.color) {
      commentStore.removeEntry(rowId);
    } else {
      commentStore.setEntry(rowId, updated);
    }
  };

  useEffect(() => {
    if (!iconRef.current) {
      return;
    }
    setIconRect(iconRef.current.getBoundingClientRect());
  }, [entry?.text]);

  useEffect(() => {
    const update = () => {
      if (!iconRef.current) {
        return;
      }
      setIconRect(iconRef.current.getBoundingClientRect());
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, []);

    const floatingComment = entry?.text && iconRect
      ? createPortal(
          <Box
            sx={{
              position: 'absolute',
              top: iconRect.top + window.scrollY - 30,
              left: 3,
              minWidth: width,
              maxWidth: width,
              height: 90,
              bgcolor: 'background.paper',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 1,
              px: 1,
              boxShadow: 3,
              fontSize: '0.7rem',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              overflowY: 'auto'
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (iconRef.current) {
              openPopover(iconRef.current);
            }
          }}
        >
          {entry.text}
        </Box>,
          document.body
        )
      : null;

  return (
    <>
      <Box
        sx={{
          width: 30,
          minHeight: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconButton size="small" onClick={handleIconClick} ref={iconRef}>
          <ChatBubbleOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
      {floatingComment}
      <Popover
        open={paletteOpen}
        anchorEl={anchorEl}
        onClose={(event: SyntheticEvent) => handleClose(event)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Box
          sx={{ p: 1, width: 260 }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2">Примечание</Typography>
            <IconButton size="small" onClick={(event) => { event.stopPropagation(); handleClose(); }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <TextField
            fullWidth
            label="Текст"
            multiline
            minRows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={handleSaveText}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSaveText();
                handleClose(event);
              }
            }}
            inputRef={textareaRef}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {PALETTE_COLORS.map((color) => (
              <Box
                key={color}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: color,
                  cursor: 'pointer',
                  border: currentColor === color
                    ? '2px solid rgba(0,0,0,0.5)'
                    : '1px solid rgba(0,0,0,0.12)',
                }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: '#fff',
                cursor: 'pointer',
                border: '1px dashed rgba(0,0,0,0.4)',
              }}
              onClick={() => handleColorSelect(null)}
            />
          </Stack>
        </Box>
      </Popover>
    </>
  );
});


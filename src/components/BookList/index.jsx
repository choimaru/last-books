import style from 'src/components/BookList/BookList.module.css';
import Image from 'next/image';
import noImage from 'public/no_image.jpg';
import { Button, createTheme, ThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { useCallback, useState } from 'react';
import { client } from 'src/libs/supabase';
import { BookModal } from 'src/components/BookModal';

const theme = createTheme({
  palette: {
    primary: {
      main: '#24b47e',
      dark: '#008351',
      contrastText: '#fff',
    },
  },
});

export const BookList = (props) => {
  const [open, setOpen] = useState(false);
  const [editBook, setEditBook] = useState('');

  // モーダルを開く
  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  // モーダルを閉じる
  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  // 修正
  const handleEdit = useCallback(async (id) => {
    const book = props.books.find((book) => {
      return book.id == id;
    });

    setEditBook(book);
    openModal();
  });

  // 削除
  const handleDelete = useCallback(async (id, title) => {
    const msg = title + 'を削除しますか？';
    if (!confirm(msg)) return;

    const { error } = await client.from('books').delete().eq('id', id);
    if (error) {
      alert(error);
    }

    props.refresh();
  }, []);

  return (
    <div className={style.box_list}>
      {props.books.length ? (
        props.books.map((book) => {
          return (
            <div key={book.id} className={style.card}>
              <div className={style.book_img}>
                {book.img_url ? (
                  <Image
                    src={book.img_url}
                    alt='thumbnail'
                    width={100}
                    height={150}
                  />
                ) : (
                  <Image
                    src={noImage}
                    alt='thumbnail'
                    width={100}
                    height={150}
                  />
                )}
              </div>
              <div className={style.book_info}>
                <div>
                  <div className={style.book_title}>{book.title}</div>
                  <div>著者：{book.author}</div>
                  {/* <div>巻数：{book.volume}</div> */}
                  <div>所持：{book.possession}</div>
                  <div>ISBN：{book.isbn}</div>
                </div>
                <div className={style.btns}>
                  <ThemeProvider theme={theme}>
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<EditIcon />}
                      size='small'
                      onClick={() => {
                        handleEdit(book.id);
                      }}
                    >
                      修正
                    </Button>
                    <Button
                      variant='contained'
                      color='secondary'
                      startIcon={<DeleteIcon />}
                      size='small'
                      onClick={() => {
                        handleDelete(book.id, book.title);
                      }}
                    >
                      削除
                    </Button>
                  </ThemeProvider>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className={style.center}>
          <br />
          <p>左上の「＋」ボタンをから本を登録してください。</p>
          <br />
          <p>
            同じ本を買ってしまわないように
            <br />
            自分が持っている最新刊を管理します。
          </p>
        </div>
      )}

      <BookModal
        uid={props.uid}
        isEdit={true}
        open={open}
        openModal={openModal}
        closeModal={closeModal}
        editBook={editBook}
        refresh={props.refresh}
      />
    </div>
  );
};

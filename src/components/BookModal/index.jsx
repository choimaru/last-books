import style from 'src/components/BookModal/BookModal.module.css';
import {
  Button,
  createTheme,
  FormControlLabel,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  ThemeProvider,
} from '@material-ui/core';
import { useCallback, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import PostAddIcon from '@material-ui/icons/PostAdd';
import CancelOutlined from '@material-ui/icons/CancelOutlined';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import { client } from 'src/libs/supabase';
import { useEffect } from 'react';
import { SearchImage } from 'src/components/SearchImage';
import { ReadIsbn } from 'src/components/ReadIsbn';

const theme = createTheme({
  palette: {
    primary: {
      main: '#24b47e',
      dark: '#008351',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff782e',
      light: '#ffa95d',
      dark: '#c54800',
      contrastText: '#fff',
    },
  },
});

export const BookModal = (props) => {
  const [radioVal, setRadioVal] = useState('title');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTxt, setSearchTxt] = useState('');
  const [searchList, setSearchList] = useState([]);
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [titleKana, setTitleKana] = useState('');
  const [author, setAuthor] = useState('');
  const [possession, setPossession] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCamera, setIsCamera] = useState(false);

  // 検索用ラジオボタン
  const handleRadioChange = (e) => {
    setRadioVal(e.target.value);
  };

  // 検索
  const handleSearch = useCallback(async () => {
    if (!searchTxt) return;

    setIsLoading(true);
    const cond = radioVal + '=' + searchTxt;
    const res = await fetch('/api/rakuten?' + cond);
    const resultList = await res.json();

    if (resultList) {
      if (resultList.size == 0) {
        alert('Not found the books.');
      } else {
        setSearchList(resultList.data);
      }
      setIsLoading(false);
    }
  }, [searchTxt]);

  // カメラでISBN
  const handleCamera = useCallback(async () => {
    setIsCamera((prev) => !prev);
  }, []);

  // 検索結果を反映
  const setSelectBook = (book) => {
    const searchIsbn = book.isbn === '' ? null : book.isbn;
    const searchTitle = book.title === '' ? null : book.title;
    const searchTitleKana = book.titleKana === '' ? null : book.titleKana;
    const searchAuthor = book.author === '' ? null : book.author;
    const searchImageUrl = book.imageUrl === '' ? null : book.imageUrl;
    setIsbn(searchIsbn);
    setTitle(searchTitle);
    setTitleKana(searchTitleKana);
    setAuthor(searchAuthor);
    setImageUrl(searchImageUrl);
  };

  // 追加 Or 修正
  const addEditStr = props.isEdit ? '修正' : '追加';

  // 本の追加 Or 修正
  const upsertBook = useCallback(async () => {
    // タイトル未入力は無視
    if (!title) return;

    // supabaseに登録
    const postIsbn = isbn === '' ? null : isbn;
    const postTitleKana = titleKana === '' ? null : titleKana;
    const postAuthor = author === '' ? null : author;
    const postPossession = possession === '' ? null : possession;
    const postImageUrl = imageUrl === '' ? null : imageUrl;

    // 登録
    let upsertData = {
      uid: props.uid,
      isbn: postIsbn,
      title: title,
      title_kana: postTitleKana,
      author: postAuthor,
      possession: postPossession,
      img_url: postImageUrl,
    };

    if (props.isEdit) {
      upsertData = { id: props.editBook.id, ...upsertData };
    }

    const { data, error } = await client.from('books').upsert([upsertData]);

    if (error) {
      alert(error);
      console.log(error);
    } else {
      if (data) {
        props.closeModal();
        props.refresh();
      }
    }
  }, [title, titleKana, author, possession, isbn, imageUrl]);

  // ISBNコードから情報を取得（楽天、oprebd）
  const setIsbnInfo = useCallback(
    async (isbn) => {
      // Rakuten API
      const resRakuten = await fetch('/api/rakuten?isbn=' + isbn);
      const dataRakuten = await resRakuten.json();
      if (dataRakuten.size) {
        const data = dataRakuten.data[0];
        const rakutenIsbn = data.isbn ? data.isbn : null;
        const rakutenTitle = data.title ? data.title : null;
        const rakutenTitleKana = data.titleKana ? data.titleKana : null;
        const rakutenAuthor = data.author ? data.author : null;
        const rakutenImageUrl = data.imageUrl ? data.imageUrl : null;
        setIsbn(rakutenIsbn);
        setTitle(rakutenTitle);
        setTitleKana(rakutenTitleKana);
        setAuthor(rakutenAuthor);
        setImageUrl(rakutenImageUrl);
      } else {
        // openbd API
        const url = 'https://api.openbd.jp/v1/get?isbn=' + isbn;
        const resOpenbd = await fetch(url);
        const dataOpenbd = await resOpenbd.json();
        if (!dataOpenbd) {
          alert('このISBNコードの書籍は見つかりませんでした。');
          return;
        }
        if (dataOpenbd[0] == null) {
          alert('このISBNコードの書籍は見つかりませんでした');
          return;
        }

        const summary = dataOpenbd[0].summary;
        const kana =
          dataOpenbd[0].onix.DescriptiveDetail.TitleDetail.TitleElement
            .TitleText.collationkey;
        const searchIsbn = summary.isbn ? summary.isbn : null;
        const searchTitle = summary.title ? summary.title : null;
        const searchTitleKana = kana ? kana : null;
        const searchAuthor = summary.author
          ? summary.author.replace('／著', '')
          : null;
        const searchImageUrl = summary.cover ? summary.cover : null;
        setIsbn(searchIsbn);
        setTitle(searchTitle);
        setTitleKana(searchTitleKana);
        setAuthor(searchAuthor);
        setImageUrl(searchImageUrl);
      }
    },
    [isbn]
  );

  const clearData = () => {
    setIsbn('');
    setTitle('');
    setTitleKana('');
    setAuthor('');
    setPossession('');
    setImageUrl('');
  };

  useEffect(() => {
    clearData();

    if (props.editBook) {
      const editIsbn = props.editBook.isbn ? props.editBook.isbn : '';
      const editTitle = props.editBook.title ? props.editBook.title : '';
      const editTitleKana = props.editBook.title_kana
        ? props.editBook.title_kana
        : '';
      const editAuthor = props.editBook.author ? props.editBook.author : '';
      const editPossession = props.editBook.possession
        ? props.editBook.possession
        : '';
      const editImgUrl = props.editBook.img_url ? props.editBook.img_url : '';

      setIsbn(editIsbn);
      setTitle(editTitle);
      setTitleKana(editTitleKana);
      setAuthor(editAuthor);
      setPossession(editPossession);
      setImageUrl(editImgUrl);
    }
  }, [props.open]);

  return (
    <div>
      <div className={style.add_navi}>
        <Modal
          open={props.open}
          onClose={props.closeModal}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <div className={style.modal_style}>
            <h1 className={style.modal_title}>{addEditStr}</h1>
            <div className={style.radioTarget}>
              <RadioGroup
                row
                aria-label='search_target'
                name='target'
                value={radioVal}
                onChange={handleRadioChange}
              >
                <FormControlLabel
                  value='title'
                  control={<Radio />}
                  label={
                    <span className={style.labelRoot}>タイトルで検索</span>
                  }
                />
                <FormControlLabel
                  value='author'
                  control={<Radio />}
                  label={<span className={style.labelRoot}>著者で検索</span>}
                />
              </RadioGroup>
            </div>
            <div className={style.inps}>
              <div className={style.search}>
                <div>
                  <TextField
                    id='search'
                    label='検索'
                    type='search'
                    size='small'
                    style={{ width: 215 }}
                    value={searchTxt}
                    onChange={(e) => {
                      setSearchTxt(e.target.value);
                    }}
                  />
                </div>
                <div className={style.search_icon}>
                  <SearchIcon fontSize='large' onClick={handleSearch} />
                </div>
                <div className={style.search_icon}>
                  <CameraAltIcon fontSize='large' onClick={handleCamera} />
                </div>
              </div>
              <div>
                <SearchImage
                  isLoading={isLoading}
                  searchList={searchList}
                  setSearchList={setSearchList}
                  setSelectBook={setSelectBook}
                />
              </div>
              <div>
                <ReadIsbn
                  isCamera={isCamera}
                  setIsCamera={setIsCamera}
                  setIsbnInfo={setIsbnInfo}
                  clearData={clearData}
                />
              </div>
              <TextField
                id='title'
                label='タイトル'
                variant='outlined'
                size='small'
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
              <TextField
                id='titleKana'
                label='タイトル カナ'
                variant='outlined'
                size='small'
                value={titleKana}
                onChange={(e) => {
                  setTitleKana(e.target.value);
                }}
              />
              <TextField
                id='author'
                label='著者'
                variant='outlined'
                size='small'
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                }}
              />
              <TextField
                id='possession'
                label='所持巻数'
                type='number'
                variant='outlined'
                size='small'
                value={possession}
                style={{ width: 120 }}
                onChange={(e) => {
                  setPossession(e.target.value);
                }}
              />
              <TextField
                id='isbn'
                label='ISBN'
                variant='outlined'
                size='small'
                value={isbn}
                onChange={(e) => {
                  setIsbn(e.target.value);
                }}
              />
            </div>
            <div className={style.btns}>
              <ThemeProvider theme={theme}>
                <Button
                  variant='contained'
                  color='secondary'
                  startIcon={<CancelOutlined />}
                  style={{ width: 120 }}
                  onClick={props.closeModal}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<PostAddIcon />}
                  style={{ width: 120 }}
                  onClick={upsertBook}
                >
                  {addEditStr}
                </Button>
              </ThemeProvider>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

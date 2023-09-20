import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { AddTitle } from 'src/components/AddTitle';
import { BookList } from 'src/components/BookList';
import { client } from 'src/libs/supabase';

const kanaArr = [];
kanaArr['あ'] = /[あ-おア-オヴAaEeIiOoUuVv]/;
kanaArr['か'] = /[か-こが-ごカ-コガ-ゴCcGgKkQq]/;
kanaArr['さ'] = /[さ-そざ-ぞサ-ソザ-ゾJjSsXxZz]/;
kanaArr['た'] = /[た-とだ-どタ-トダ-ドDdTt]/;
kanaArr['な'] = /[な-のナ-ノNn]/;
kanaArr['は'] = /[は-ほぱ-ぽば-ぼハ-ホパ-ポバ-ボBbFfHhPp]/;
kanaArr['ま'] = /[ま-もマ-モMm]/;
kanaArr['や'] = /[や-よヤ-ヨYy]/;
kanaArr['ら'] = /[ら-ろラ-ロLlRr]/;
kanaArr['わ'] = /[わ-んワ-ンWw]/;

export const MainBooks = (props) => {
  const [orgBooks, setOrgBooks] = useState([]);
  const [books, setBooks] = useState([]);

  // 一覧の取得
  const getBookList = useCallback(async () => {
    const { data, error } = await client
      .from('books')
      .select('*')
      .order('title_kana')
      .order('title');

    if (!error && data) {
      setOrgBooks(data);
      setBooks(data);
    }
  }, []);

  const selectFilter = useCallback(
    (kana) => {
      if (kana === 'ALL') {
        setBooks(orgBooks);
        return;
      }

      const pattern = kanaArr[kana];
      const filterBooks = orgBooks.filter((org) => {
        const str = org.title_kana ? org.title_kana.slice(0, 1) : '';
        if (pattern.test(str)) {
          return org;
        }
      });
      setBooks(filterBooks);
    },
    [books]
  );

  useEffect(() => {
    getBookList();
  }, []);

  const refresh = () => {
    getBookList();
  };

  return (
    <div>
      <AddTitle uid={props.uid} refresh={refresh} selectFilter={selectFilter} />
      <BookList uid={props.uid} books={books} refresh={refresh} />
    </div>
  );
};

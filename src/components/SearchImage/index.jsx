import style from 'src/components/SearchImage/SearchImage.module.css';
import { CircularProgress } from '@material-ui/core';
import Image from 'next/image';

export const SearchImage = (props) => {
  const handleClick = (book) => {
    props.setSearchList([]);
    props.setSelectBook(book);
  };

  return (
    <div>
      {props.isLoading ? (
        <div className={style.progress}>
          <CircularProgress size={20} />
        </div>
      ) : (
        <div className={style.box_result}>
          {props.searchList.map((list, idx) => {
            return (
              <div
                className={style.card}
                key={idx}
                onClick={() => {
                  handleClick(list);
                }}
              >
                <div>
                  <Image
                    src={list.imageUrl}
                    alt='thumbnail'
                    width={126}
                    height={200}
                  />
                </div>
                <div className={style.title}>{list.title}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

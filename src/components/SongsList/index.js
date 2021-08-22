import React from 'react';
import { connect } from "react-redux";
import { fetchMoreSongs, fetchAlbum } from "../../store/actions/songsActions";
import { setTrackIndex, togglePlay } from "../../store/actions/playerActions";
import Loading from "../Loading";
import styled from "styled-components";
import { FaArrowUp, FaShare } from "react-icons/fa";

const Wrapper = styled.div`
  height: 65%;
  width: 100vw;
  flex: 1 1 auto;
  position: relative;
  background: #fff;
  padding: 12px;
`;
const List = styled.ul`
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  list-style-type: none;
  height: 100%;
  width: 100%;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const ListItem = styled.li`
  margin: 1% auto;
  width: 90%;
  height: 12%;
  max-height: 80px;
  min-height: 65px;
  background: hsla(0, 0%, 100%, 0.25);
  border: 1px solid #eaeaea
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.14, 1.35, 0.54, 1.95),
    background 0.2s ease-in-out;
  &:hover {
    transform: scale(1.01);
  }
`;
const LoadMoreButton = styled.button`
  display: block;
  width: 100%;
  height: 100%;
  background: none;
  cursor: pointer;
  border: none;
  outline: none;
`;
const Title = styled.a`
  flex: 1;
  display: block;
  font-size: 1.2em;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const Artist = styled.a`
  flex: 1;
  font-size: 0.9em;
  font-style: italic;
`;
const Album = styled.img`
  height: 100%;
  padding :8px;
`;

const LinkParaDeezzer = styled.a`
  width: 100px;
  padding: 5px;
  position: relative;
  text-decoration: none;
  color:#000000;

  p{
    display:none!important;
    position:absolute;
    font-size: 70%;
    padding:2px;
    width:100%;
    top: 20px;
    left:-30px;
    color:#000000;
    text-align:center;
    background-color: #b4b3b5;
  }
  &:hover > p {
    display:flex!important;
  }
`;

const BoxMusic = styled.div`
  display:flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding-left: 10px;
  width: 100%;
  pointer-events: none;

  p{
    display: flex;
    justify-content:center;
  }
  a{
    display: flex;
    justify-content:center;
  }
`;

const SongsList = props => {
  const handleClick = e => {
    const { tagName, dataset } = e.target;
    if (tagName === "IMG") return;
    const { index } = dataset;
    props.setTrackIndex(Number(index));
    props.togglePlay(true);
  };

  const handleAlbumClick = e => {
    const { index } = e.target.parentElement.dataset;
    const { songs } = props.state.songs;
    const { id } = songs[index].album;
    if (!id) return;
    props.setTrackIndex(0);
    props.togglePlay(false); 
    props.loadAlbum(id);
  };

  const { songs, lastQuery, index, isFetching} = props.state.songs;

  const checkActive = index => {
    return Number(index) === props.state.player.trackIndex
      ? { background: "hsla(0, 100%, 100%, 0.5)", transform: "scale(1.05)" }
      : null;
  };


  return (
    <Wrapper id="Wrapper">
      {isFetching && <Loading />}
      {songs.length ? (
        <List
          style={isFetching ? { opacity: 0.4, pointerEvents: "none" } : null}
        >
          {songs.map((song, i) => {
            const {
              id: id,
              title_short: title,
              artist: { name },
              album: { cover }
            } = song;
            return (
              <ListItem id="list-item"
                style={checkActive(i)}
                data-index={i}
                onClick={e => handleClick(e)}
                key={i}
              >
              <Album id="album" onClick={handleAlbumClick} alt="album" src={cover}/>
                <BoxMusic>
                  <Artist  id="artist" src={name}>{name}</Artist >
                  <Title onClick={handleAlbumClick} id="title" src={cover}>{title}</Title>
                </BoxMusic>
                  <LinkParaDeezzer href={`https://www.deezer.com/track/${id}`}>
                    <FaShare/>
                    <p>Play no deezer</p>
                  </LinkParaDeezzer>
              </ListItem>
            );
          })}
          {songs.length >= 1 && lastQuery && (
            <ListItem id="list-item">
              <LoadMoreButton onClick={() => props.loadMore(lastQuery, index)}>
                load more...
              </LoadMoreButton>
            </ListItem>
          )}
        </List>
      ) : (
        <p style={{ textAlign: "center" }}>
          Ate agora só conseguir fazer buscar as musicas, por favor tente isso
        </p>

      )}
    </Wrapper>
  );
};

const mapStateToProps = state => {
  return { state };
};

const mapDispatchToProps = dispatch => {
  return {
    loadMore: (lastQuery, index) => dispatch(fetchMoreSongs(lastQuery, index)),
    loadAlbum: id => dispatch(fetchAlbum(id)),
    setTrackIndex: src => dispatch(setTrackIndex(src)),
    togglePlay: isPlaying => dispatch(togglePlay(isPlaying))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SongsList);

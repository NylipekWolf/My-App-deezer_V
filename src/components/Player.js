import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { setTrackIndex, togglePlay } from "../redux/actions/playerActions";
import { setTimeStamp } from "../utils";
import styled from "styled-components";
import { isIOS } from "react-device-detect";
import { IoIosPlay, IoIosPause } from "react-icons/io"
import { GoChevronRight, GoChevronLeft } from "react-icons/go"
import { FaVolumeOff } from "react-icons/fa";

const PlayerWrapper = styled.div`
  width: 100%;
  height: 80px;
  background: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  border-top: 1px solid #eaeaea;
`;
const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;
const Progress = styled.div`
border-radius: 50px;
background: #022740;
flex-basis: 0%;
`;
const Buttons = styled.div`
display: flex;
width: 15%;
justify-content: center;
align-items: center;
font-size: 1.25em;
z-index: 1;
margin-right:65px;
`;
const Button = styled.button`
cursor: pointer;
background: none;
border: none;
font-size: 1.5em;
outline: none;
transition: transform 0.2s cubic-bezier(0.14, 1.35, 0.54, 1.95);

  #play_pause{
    font-size: 1.52em;
  }
  
  &:hover {
    transform: scale(1.1);
  }
  &:focus {
    transform: scale(1.1);
  }
  
  @media (min-width: 768px) {
    margin: 0 5%;
  }
  `;

  const CurrentTrack = styled.a`
  display: block;
  color: #000000;
  font-size: 0.9em;
  z-index: 1;
  width: 25%;
  overflow-x: hidden;
  text-overflow: ellipsis;
  text-align: inherit;
  white-space: nowrap;
  position: absolute;
  top: 22px;
  left: 248px;
  `;
  const ProgressBar = styled.div`
    height: 2%;
    border-radius: 50px;
    background: #000000;
    width: 45%;
    display: flex;
    cursor: pointer;
    z-index: 1;
    margin-top: 20px;
    position: relative;
    span {
      font-size: 10px;
    }
  `;
const VolumeBar = styled.div`
  height: 8px;
  min-height: 5px;
  border-radius: 50px;
  background: #404040;
  width: 60%;
  max-width: 400px;
  display: flex;
  cursor: pointer;
  position: relative;
  margin: 0 2.5%;
`;
const Volume = styled.div`
  border-radius: 50px;
  background: #0a0101;
  flex-basis: 50%;
`;

const BoxVolume = styled.div`
  width: 200px;
  display:flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
  display: flex;
  position: absolute;
  right: 0;
  margin-top: 20px;
  border-radius: 2%;
  padding:2px 0;
  box-shadow: 0 4px 20px 0 rgba(25, 25, 34, 0.11);
  
`;

const Player = props => {
  const { songs: playlist } = props.state.songs;
  const { isPlaying, trackIndex } = props.state.player;

  const audio = useRef(null);
  const canvas = useRef(null);
  const ctx = useRef(null);
  const progressRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeRef = useRef(null);
  const volumeBarRef = useRef(null);
  const timeRef = useRef(null);
  const durationRef = useRef(null);

  const WIDTH = 1000;
  const HEIGHT = 1000;
  let analyzer;
  let bufferLength;

  useEffect(() => {
    audio.current.volume = 0.5;
  }, []);

  //check the isPlaying flag and play/pause audio
  useEffect(() => {
    if (!isPlaying) {
      audio.current.pause();
    } else {
      audio.current.play();
    }
  });

  useEffect(() => {
    ctx.current = canvas.current.getContext("2d");
    canvas.current.width = WIDTH;
    canvas.current.height = HEIGHT;
  }, [WIDTH, HEIGHT]);

  const getAudioData = async () => {
    if (!audio.current.captureStream) return;
    const stream = audio.current.captureStream();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);

    analyzer = audioCtx.createAnalyser();
    source.connect(analyzer);

    analyzer.fftSize = 2 ** 7;

    bufferLength = analyzer.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    durationRef.current.innerText = setTimeStamp(audio.current.duration);
    drawFrequency(frequencyData);
  };

  const drawFrequency = frequencyData => {
    ctx.current.clearRect(0, 0, WIDTH, HEIGHT);

    analyzer.getByteFrequencyData(frequencyData);

    const barWidth = (WIDTH / bufferLength) * 2.5;
    let x = 0;

    frequencyData.forEach(amount => {
      const percent = amount / 255;
      const barHeight = HEIGHT * percent;

      ctx.current.fillStyle = `hsla(204, 96%, 49%, ${percent})`;
      ctx.current.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      x += barWidth;
    });

    requestAnimationFrame(() => drawFrequency(frequencyData));
  };

  const handlePlayPause = () => {
    if (!audio.current.src) return;
    if (isPlaying) {
      props.togglePlay(false);
    } else {
      props.togglePlay(true);
    }
  };

  const playPrev = () => {
    const newIndex = trackIndex > 0 ? trackIndex - 1 : 0;
    props.setTrackIndex(newIndex);
  };
  const playNext = () => {
    const lastIndex = playlist.length - 1;
    const newIndex = trackIndex < lastIndex ? trackIndex + 1 : 0; //if playing last song, play first one on next
    props.setTrackIndex(newIndex);
  };

  const handleProgress = () => {
    const { currentTime, duration } = audio.current;
    const percent = (currentTime / duration) * 100;
    progressRef.current.style.flexBasis = `${percent}%`;
    setTimeStamp(currentTime);
    durationRef.current.innerText = setTimeStamp(duration);
    timeRef.current.innerText = setTimeStamp(currentTime);
  };

  const handleProgressChange = e => {
    e.persist();
    if (!audio.current.currentTime) return;
    const { width, left } = progressBarRef.current.getBoundingClientRect();
    const percent = (e.pageX - left) / width;
    audio.current.currentTime = percent * audio.current.duration;
  };

  const handleVolumeChange = e => {
    e.persist();
    const { width, left } = volumeBarRef.current.getBoundingClientRect();
    const percent = (e.pageX - left) / width;
    audio.current.volume = percent;
    volumeRef.current.style.flexBasis = `${percent * 100}%`;
  };

  const handleMute = volume => {
    audio.current.volume = volume;
    volumeRef.current.style.flexBasis = `${volume * 100}%`;
  };

  return (
    <PlayerWrapper id="PlayerWrapper">
      <audio
        onTimeUpdate={handleProgress}
        onCanPlayThrough={!isIOS && getAudioData}
        crossOrigin="anonymous"
        onEnded={playNext}
        ref={audio}
        src={playlist[trackIndex] && playlist[trackIndex].preview}
      ></audio>
      <Canvas ref={canvas}></Canvas>
      <CurrentTrack id="CurrentTrack" >
        {playlist[trackIndex]
          ? `${playlist[trackIndex].artist.name} - ${playlist[trackIndex].title}`
          : "..."}
      </CurrentTrack>
      <Buttons id="Buttons">
        <Button id="Button" onClick={playPrev}>
          <GoChevronLeft />
        </Button>
        <Button onClick={handlePlayPause}>
          {!isPlaying ? <IoIosPlay id="play_pause" /> : <IoIosPause id="play_pause" />}
        </Button>
        <Button onClick={playNext}>
          <GoChevronRight />
        </Button>
      </Buttons>
      <ProgressBar id="ProgressBar" ref={progressBarRef} onClick={handleProgressChange}>
        <span style={{ position: "absolute", left: -50, top: "-276%" }} ref={timeRef}>
          00:00
        </span>
        <Progress id="progress" ref={progressRef}></Progress>
        <span style={{ position: "absolute", right: -50, top: "-276%" }}ref={durationRef}>
          00:00
        </span>
      </ProgressBar>
        <BoxVolume id="BoxVolume">
          <FaVolumeOff id="FaVolumeOff" style={{ cursor: "pointer" }}onClick={() => handleMute(0)}/>
          <VolumeBar id="VolumeBar" ref={volumeBarRef} onClick={handleVolumeChange}>
            <Volume id= "volume" ref={volumeRef}></Volume>
          </VolumeBar>
        </BoxVolume>
    </PlayerWrapper>
  );
};

const mapStateToProps = state => {
  return { state };
};

const mapDispatchToProps = dispatch => {
  return {
    setTrackIndex: elements => dispatch(setTrackIndex(elements)),
    togglePlay: isPlaying => dispatch(togglePlay(isPlaying))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Player);

'use client';

import { createWorker } from "tesseract.js"
import { useState, useRef, useEffect } from "react";
import Loading from "./components/Loading";
import { BiMicrophone } from 'react-icons/bi'

export default function Home() {

  const [progress, setProgress] = useState([]);
  const [status, setStatus] = useState([]);
  const [text, setText] = useState([]);
  const [file, setFile] = useState([]);
  const regex = /^.*\.(jpg|jpeg|png)$/i
  const ref = useRef(null);
  const [send, setSend] = useState(false)

  const recognizedImage = (images) => {

    let tmp = new Array(images.length).fill(0);
    let tmpText = new Array(images.length).fill('');
    let tmpStatus = new Array(images.length).fill('');

    if (text.length > 0) {
      tmpText = [...text, ...tmpText];
    }

    images.map(async (image, index) => {
      // return Tesseract.recognize(image, 'spa', {
      //   logger: m => {
      //     tmp[index] = Math.floor(m.progress * 100);
      //     setProgress([...tmp])
      //   }
      // }).then(({ data }) => {
      //   try {
      //     tmpText[index] = data.text;
      //     setText([...tmpText])
      //   } catch (e) {}
      // });

      let worker = await createWorker({
        logger: m => {
          tmp[index] = Math.floor(m.progress * 100)
          tmpStatus[index] = m.status;
          setProgress([...tmp])
          setStatus([...tmpStatus])
        }
      })

      await worker.loadLanguage('spa')
      await worker.initialize('spa')
      const {data} = await worker.recognize(image);
      tmpText[text.length > 0 ? index+text.length : index] = index == images.length-1 ? data.text : data.text+'&^'
      setText([...tmpText])
      await worker.terminate()


    });


  }

  const handleChange = e => {
    const { name } = e.target;
    if (name === 'file') {
      if(e.target.files.length === 0) setFile([])
      let tmp = [];
      let validation = [];
      for(let i=0; i<e.target.files.length; i++) {
        if(!regex.test(e.target.files[i].name)) {
          validation.push(false)
        }
        tmp.push(e.target.files[i])
      }
      if (validation.includes(false)) {
        setText(['Solo se permiten .jpg, .jpeg o .png!'])
        setFile([])
        return;
      }
      setFile(tmp)
    }
  }

  const handleSubmit = e => {
    e.preventDefault();
    if (!file.length > 0) setText(['Selecciona imagenes.'])
    recognizedImage(file);
    setSend(true)
  }

  const clearFunction = () => {
    setText([]);
    setProgress([]);
    setFile([]);
    setSend(false)
    setStatus([])
  }

  const handleClear = (e) => {
    e.target.parentNode.parentNode.reset()
    clearFunction();
  }

  useEffect(() => {

    if (ref.current != null || typeof ref.current != 'undefined') {
      ref.current.disabled = send;
      ref.current.style.opacity = send ? .6 : 1
      if (!send) {
        setProgress([])
        setStatus([])
        setFile([])
      }
    }

  }, [send])

  useEffect(() => {
      
    if (progress.length > 0) {
      let banStatus = [...status.filter((st) => st === 'recognizing text')]
      let completedProgress = [...progress.filter((pr) => pr === 100)]

      if(banStatus.length === progress.length && completedProgress.length === progress.length) {
        setSend(false)
      }
    }

  }, [progress])

  const recognitionVoice = () => {
    if (!'webkitSpeechRecognition' in window) {alert('La api de reconocimiento de voz no esta disponible en este navegador.'); return;}
    
    const recognition = new webkitSpeechRecognition();

    recognition.onresult = (e) => {
      console.log(e.results)
    }

    recognition.onerror = (e) => {
      console.error(e.error)
    }

    recognition.onend = () => {
      console.log('Reconocimiento terminado')
    }

    recognition.start();

  }

  return (
    <div className="flex flex-col min-h-screen max-h-screen">
      <header className="p-4 bg-blue-500">
        <h1 className="text-white">Tesseract JS</h1>
      </header>
      <main className="p-8 flex-grow">
        <div className="flex flex-col gap-4">
          {
            file.length > 0 ? file.map((archivo, index) => <Loading progress={progress[index] || 0} key={index} />
            )
            : <></>
          }
        </div>
        <form className="w-full max-w-5xl mx-auto flex flex-col items-center py-4 gap-4" onSubmit={handleSubmit}>
          <div className="relative w-full max-w-md mx-auto py-10 px-5">
            <input type="file" name="file" id="file" onChange={handleChange} multiple className="absolute top-0 left-0 w-full h-full opacity-0 z-10 cursor-pointer" />
            <span className="absolute top-0 left-0 w-full h-full flex justify-center items-center border-dashed border-4 border-blue-500 text-center">Selecciona imagenes o arrastralas</span>
          </div>
          {
            file.length > 0 && (
              <ul className="text-gray-500">
                {file.map((archivo, index) => <li key={index}>{archivo.name}</li>)}
              </ul>
            )
          }
          <textarea name="results" id="results" value={text.toString()} onChange={handleChange} className="bg-slate-200 p-4 w-full" style={{minHeight: 500, height: '100%', maxHeight: 800}} readOnly></textarea>
          <div className="flex justify-between gap-4 w-full flex-wrap">
            <button className="bg-blue-500 p-4 text-white grow transition-colors hover:bg-blue-400" ref={ref} style={{
              minWidth: 250
            }}>Enviar</button>
            <button type="button" className="bg-green-600 p-4 text-white grow transition-colors hover:bg-green-400" onClick={(e) => handleClear(e)} style={{
              minWidth: 250
            }}>Limpiar</button>
            {/* <button type="button" className="bg-blue-300 p-4 rounded-full transition-colors hover:bg-blue-200" style={{
              minWidth: 50
            }} onClick={recognitionVoice}>
              <BiMicrophone className="text-2xl" />
            </button> */}
          </div>
        </form>
      </main>
      <footer className="bg-black text-white px-3 py-4 text-center">
        <p>Creado por Luciano Luna</p>
      </footer>
    </div>
  )
}

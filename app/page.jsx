'use client';

import Tesseract, { createWorker } from "tesseract.js"
import { useEffect, useState } from "react";
import Loading from "./components/Loading";

export default function Home() {

  const [progress, setProgress] = useState([]);
  const [text, setText] = useState([]);
  const [file, setFile] = useState([]);

  const recognizedImage = (images) => {
    let tmp = new Array(images.length).fill(0);
    let tmpText = new Array(images.length).fill('');

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
          setProgress([...tmp])
        }
      })

      await worker.loadLanguage('spa')
      await worker.initialize('spa')
      const {data} = await worker.recognize(image);
      tmpText[index] = data.text;
      setText([...tmpText])
      await worker.terminate()


    });


  }

  const handleChange = e => {
    const { name } = e.target;
    if (name === 'results') setText(e.target.value);
    if (name === 'file') {
      if(e.target.files.length === 0) setFile([])
      let tmp = [];
      for(let i=0; i<e.target.files.length; i++) {
        tmp.push(e.target.files[i])
      }
      setFile(tmp)
    }
  }

  const handleSubmit = e => {
    e.preventDefault();
    if(file !== null) recognizedImage(file)
  }

  const handleClear = (e) => {
    setText([]);
    setProgress([]);
    setFile([]);
    e.target.parentNode.parentNode.reset()
  }

  return (
    <main>
      <header className="p-4 bg-blue-500">
        <h1 className="text-white">Tesseract JS</h1>
      </header>
      <main className="p-8">
        <div className="flex flex-col gap-4">
          {
            file.length > 0 ? file.map((archivo, index) => <Loading progress={progress[index] || 0} key={index} />
            )
            : <></>
          }
        </div>
        <form className="w-9/12 mx-auto flex flex-col items-center py-4 gap-4" onSubmit={handleSubmit}>
          <input type="file" name="file" id="file" onChange={handleChange} multiple />
          <textarea name="results" id="results" value={text.toString()} onChange={handleChange} className="bg-slate-200 p-4 w-full" style={{minHeight: 500, height: '100%', maxHeight: 800}} readOnly></textarea>
          <div className="flex justify-between gap-4 w-full">
            <button className="bg-blue-500 p-4 text-white grow">Send</button>
            <button type="button" className="bg-green-600 p-4 text-white grow" onClick={(e) => handleClear(e)}>Clear</button>
          </div>
        </form>
      </main>
    </main>
  )
}

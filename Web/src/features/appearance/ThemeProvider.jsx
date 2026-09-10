import { useEffect,useState } from 'react'
import { ThemeContext,readPreference } from './ThemeContext'
export function ThemeProvider({children}){
 const [preference,setChoice]=useState(readPreference)
 const [systemDark,setSystemDark]=useState(()=>window.matchMedia?.('(prefers-color-scheme: dark)').matches??false)
 const resolved=preference==='system'?(systemDark?'dark':'light'):preference
 useEffect(()=>{const media=window.matchMedia?.('(prefers-color-scheme: dark)');if(!media)return;const update=e=>setSystemDark(e.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[])
 useEffect(()=>{document.documentElement.dataset.theme=resolved;document.documentElement.style.colorScheme=resolved;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',resolved==='dark'?'#0d1726':'#0284c7')},[resolved])
 useEffect(()=>{const sync=e=>{if(e.key==='ortos.theme'||e.key===null)setChoice(readPreference())};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[])
 const setPreference=value=>{setChoice(value);try{localStorage.setItem('ortos.theme',value)}catch{/* Preference still works for the current page. */}}
 return <ThemeContext.Provider value={{preference,resolved,setPreference}}>{children}</ThemeContext.Provider>
}


import { createContext } from 'react'
export const ThemeContext=createContext({preference:'system',resolved:'light',setPreference:()=>{}})
export function readPreference(){try{const value=localStorage.getItem('ortos.theme');return ['light','dark','system'].includes(value)?value:'system'}catch{return 'system'}}


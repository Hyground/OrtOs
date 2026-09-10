import { useContext,useState } from 'react'
import { ThemeContext } from './ThemeContext'
import { Modal } from '@/components/ui/Modal/Modal'
import { IconSun,IconMoon,IconMonitor } from '@/components/icons/icons'
import styles from './ThemeControl.module.css'
export function ThemeControl(){
 const {preference,resolved,setPreference}=useContext(ThemeContext);const [open,setOpen]=useState(false)
 return <><button type="button" className={styles.trigger} aria-label="Apariencia: día y noche" title="Apariencia" onClick={()=>setOpen(true)}>{resolved==='dark'?<IconMoon/>:<IconSun/>}</button><Modal open={open} title="Apariencia" onClose={()=>setOpen(false)}><p>Elige cómo quieres ver OrtOs.</p><fieldset className={styles.choices}><legend>Modo de color</legend>{[['light','Claro',IconSun],['dark','Oscuro',IconMoon],['system','Predeterminado del sistema',IconMonitor]].map(([value,label,Icon])=><label key={value} className={styles.option}><Icon/><span>{label}</span><input type="radio" name="theme" value={value} checked={preference===value} onChange={()=>setPreference(value)}/></label>)}</fieldset><p className={styles.note}>La opción Sistema sigue los cambios de apariencia de tu dispositivo. Tu preferencia se guarda en este navegador.</p></Modal></>
}


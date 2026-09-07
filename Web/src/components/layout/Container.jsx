import styles from './Container.module.css'

export function Container({ as: Tag = 'div', className, children }) {
  return <Tag className={[styles.container, className].filter(Boolean).join(' ')}>{children}</Tag>
}

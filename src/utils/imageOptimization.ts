// 画像最適化ユーティリティ

/**
 * 画像を遅延読み込みするためのIntersection Observer
 */
export const createLazyImageObserver = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src
          
          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            img.classList.remove('lazy')
            img.classList.add('loaded')
          }
        }
      })
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01
    }
  )
}

/**
 * 画像プリロード
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * WebP対応チェック
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * 最適な画像フォーマットを取得
 */
export const getOptimalImageFormat = async (originalSrc: string): Promise<string> => {
  const isWebPSupported = await supportsWebP()
  
  if (isWebPSupported && originalSrc.includes('.')) {
    const extension = originalSrc.split('.').pop()
    if (extension && ['jpg', 'jpeg', 'png'].includes(extension.toLowerCase())) {
      return originalSrc.replace(`.${extension}`, '.webp')
    }
  }
  
  return originalSrc
}
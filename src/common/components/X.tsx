import React from 'react'
import Image from '@components/Image'

interface Xprops{
  className:string;
}

export default function X(props:Xprops) {
  return (
    <Image src={"https://firebasestorage.googleapis.com/v0/b/tedxccet.appspot.com/o/assets%2Fxlogo.png?alt=media&token=909c4bc2-d2da-43eb-addc-fee9a1501a53"} height={380} width={380} alt='' className={props?.className}/>
  )
}

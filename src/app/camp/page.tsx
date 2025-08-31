/** 
 * This is the map page.
 * Dynamic is used as such with the map being a different component 
 * so that leaflet will run on the client side.
*/
'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('../components/Map'), { ssr: false })

const CampPage = () => {
  return (
    <div className='mt-20'>
      <Map></Map>
    </div>
  );
};

export default CampPage;
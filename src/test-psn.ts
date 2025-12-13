import dotenv from 'dotenv';
dotenv.config();

import { exchangeNpssoForAccessCode, exchangeAccessCodeForAuthTokens, getUserTitles, TrophyTitle } from "psn-api";

async function testPSN() {
  try {
    const npsso = process.env.PSN_NPSSO!;

    console.log('Testing NPSSO', npsso);

    const accessCode = await exchangeNpssoForAccessCode(npsso);   
    console.log('Authorization code ottenuto');
    
    const authorization = await exchangeAccessCodeForAuthTokens(accessCode);
    console.log('Acces token ottenuto');
    
    const titles = await getUserTitles(authorization, 'me', { limit: 5 });
    console.log('PSN API funziona');
    console.log('\n Primi 5 giochi nel tuo profilo:');
    titles.trophyTitles.forEach((title: TrophyTitle) => {
      console.log(`- ${title.trophyTitleName}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPSN();
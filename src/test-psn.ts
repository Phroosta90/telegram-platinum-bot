import dotenv from 'dotenv';
dotenv.config();

import { exchangeNpssoForAccessCode, exchangeAccessCodeForAuthTokens, getUserTitles, TrophyTitle } from "psn-api";

async function testPSN() {
  try {
    const npsso = process.env.PSN_NPSSO!;

    const accessCode = await exchangeNpssoForAccessCode(npsso);
    
    const authorization = await exchangeAccessCodeForAuthTokens(accessCode);
    
    const titles = await getUserTitles(authorization, 'me', { limit: 5 });
    console.log('\n Primi 5 giochi nel tuo profilo:');
    titles.trophyTitles.forEach((title: TrophyTitle) => {
      console.log(`- ${title.trophyTitleName}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPSN();
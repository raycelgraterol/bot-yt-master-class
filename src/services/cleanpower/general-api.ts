import axios from "axios";
import fs from 'fs';

interface Article {
    _id: string;
    Titulo: string;
}

const getArticle = async (_id: string): Promise<string> => {
    try {
        const generateContent = {
            method: 'get',
            url: `https://help.cleanpower.global/version-test/api/1.1/obj/aritculos/${_id}`,
        };

        const axiosResult = await axios(generateContent);

        const result = axiosResult.data.response.Descripcion;

        return result;

    } catch (e) {
        console.error('Error getting:', e);
        throw e;
    }
};


const getAllArticles = async (): Promise<string[]> => {
    try {
        const allArticles: string[] = [];

        let cursor = 0;
        let remaining = 1; // Initialize remaining to a non-zero value to enter the loop

        while (remaining > 0) {
            const generateContent = {
                method: 'get',
                url: `https://help.cleanpower.global/version-test/api/1.1/obj/aritculos?cursor=${cursor}`,
            };

            const axiosResult = await axios(generateContent);

            const results = axiosResult.data.response.results;

            // Append the current page of results to the array
            allArticles.push(...results.map((article: any) => `ID: ${article._id} : ${article.Titulo}`));

            // Update cursor and remaining for the next request
            cursor += 100;
            remaining = axiosResult.data.response.remaining;
        }

        const chunk = allArticles.splice(0, 100);
        const path = `${process.cwd()}/data/articles100.txt`;

        const file = fs.createWriteStream(path);

        file.on('error', (err) => {
            console.error(err);
        });

        chunk.forEach((v) => {
            file.write(`${v}\n`);
        });

        file.end();

        return chunk;

    } catch (e) {
        console.error('Error getting articles:', e);
        throw e;
    }
};

export { getArticle, getAllArticles };

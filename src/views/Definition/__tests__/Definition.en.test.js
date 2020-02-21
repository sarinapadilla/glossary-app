import { act, cleanup, render } from '@testing-library/react';
import React from 'react';
import { useParams } from 'react-router';
import { ClientContextProvider } from 'react-fetching-library';

import { testIds } from '../../../constants';
import Definition from '../Definition';
import { useStateValue } from '../../../store/store.js';
import fixtures from '../../../utils/fixtures';

jest.mock('react-router');
jest.mock("../../../store/store.js");

let client;
let definition;
let wrapper;

const { getFixture } = fixtures;
const fixturePath = `/Terms/Cancer.gov/Patient`;
const hpvFile = '44386__hpv.json';
const metastaticFile = '44058__metastatic.json';

describe('Definition component with English', () => {
    const idOrPurl = 'metastatic';
    const language = 'en';

    definition = getFixture(`${fixturePath}/${language}/${metastaticFile}`);

    client = {
        query: async () => ({
            error: false,
            status: 200,
            payload: definition
        }),
    };

    beforeEach( async () => {
        const dictionaryName = 'Cancer.gov';
        const dictionaryTitle = 'NCI Dictionary of Cancer Terms';
        useParams.mockReturnValue({
            idOrName: idOrPurl
        });
        useStateValue.mockReturnValue([
          {
            appId: "mockAppId",
            basePath: '/',
            dictionaryName,
            dictionaryTitle,
            language
          }
        ]);

        await act( async () => {
            wrapper = render(
                <ClientContextProvider client={client}>
                    <Definition/>
                </ClientContextProvider>
            );
        });
    });

    afterEach(() => {
        cleanup();
    });

    test('Match Term Name for Definition', () => {
        const { getByText } = wrapper;
        expect(getByText(idOrPurl)).toBeTruthy();
    });

    test('Ensure attribute "data-cdr-id" exists with correct value for Definition component', () => {
        const { getByTestId } = wrapper;
        expect(getByTestId(testIds.TERM_DEF_TITLE)).toHaveAttribute('data-cdr-id', `${definition.termId}`);
    });

    test('Images specified in media are displayed', () => {
        const {container} = wrapper;
        expect(container.querySelectorAll('figure.image-left-medium').length).toEqual(1);
    });

    test('Video specified in media are displayed', () => {
        const {container} = wrapper;
        expect(container.querySelectorAll('figure.video').length).toEqual(1);
    });


    describe('Displaying the information for the term "hpv"', () => {
        const idOrPurl = 'hpv';
        beforeEach(cleanup);
        test('Ensure pronunciation is not displayed for a definition without one', async () => {
            definition = getFixture(`${fixturePath}/${language}/${hpvFile}`);

            const client = {
                query: async () => ({
                    error: false,
                    status: 200,
                    payload: definition
                }),
            };

            useParams.mockReturnValue({
                idOrName: idOrPurl
            });

            await act( async () => {
                wrapper = render(
                    <ClientContextProvider client={client}>
                        <Definition/>
                    </ClientContextProvider>
                );
            });
            const { queryByTestId } = wrapper;
            expect(queryByTestId(testIds.TERM_DEF_PRONUNCIATION)).toBeNull();
        });

        test('No media should be displayed when empty', () => {
            const {container} = wrapper;
            expect(container.querySelectorAll('figure.video').length).toEqual(0);
            expect(container.querySelectorAll('figure.image-left-medium').length).toEqual(0);
        });
    
    });
});




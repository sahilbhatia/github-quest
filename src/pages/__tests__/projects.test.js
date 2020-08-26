import '@testing-library/jest-dom'
import React from 'react';
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import Projects from '../projects'

const server = setupServer(
  rest.get('/api/getProjects', (req, res, ctx) => {
    return res(ctx.json({
      projects: [
        {
          id: 5,
          org_project_id: "53ecc4c94a6f7301790e0000",
          name: "AceMoney V1",
          is_active: false,
          project_manager: null,
          created_at: "2020-08-20T04:51:29.921Z",
          updated_at: "2020-08-20T04:51:29.921Z",
          users_projects: [],
          projects_repositories: []
        },
        {
          id: 6,
          org_project_id: "53ecc4c94a6f7301790e0001",
          name: "AceMoney V2",
          is_active: false,
          project_manager: null,
          created_at: "2020-08-20T04:51:29.921Z",
          updated_at: "2020-08-20T04:51:29.921Z",
          users_projects: [],
          projects_repositories: []
        },
      ],
      date: { min: "2020-08-20T04:51:29.909Z" }
    }))
  })
);

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('show project list', async () => {
  const { getByTestId } = render(<Projects />)
  await waitFor(() => {
    expect(getByTestId('projectList')).toBeInTheDocument()
  })
  const component = await screen.getByTestId("projectList")
  expect(component).toHaveTextContent("Back")
});


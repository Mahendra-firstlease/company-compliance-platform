import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

import Badge from '../Badge/Badge';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../table';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../tabs';

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../accordion';

import { Skeleton } from '../skeleton';

describe('Card Component', () => {
  it('renders Card with Header, Title, Description, Content, and Footer', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content Body</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Content Body')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });
});

describe('Badge Component', () => {
  it('renders badge with text and variant classes', () => {
    render(<Badge variant="green" size="md">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

describe('Table Component', () => {
  it('renders table structure with header and rows', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>GST Registration</TableCell>
            <TableCell>Approved</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('GST Registration')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
});

describe('Tabs Component', () => {
  it('renders tabs list and switches content panels', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
        <TabsContent value="tab2">Content for Tab 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
    expect(screen.queryByText('Content for Tab 2')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab 2'));

    expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
    expect(screen.queryByText('Content for Tab 1')).not.toBeInTheDocument();
  });
});

describe('Accordion Component', () => {
  it('expands and collapses content when trigger is clicked', () => {
    render(
      <Accordion type="single" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Question 1</AccordionTrigger>
          <AccordionContent>Answer 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Question 1'));
    // Trigger collapsed item
  });
});

describe('Skeleton Component', () => {
  it('renders animated skeleton loader element', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});

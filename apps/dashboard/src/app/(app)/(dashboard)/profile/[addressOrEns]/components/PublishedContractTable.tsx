/** biome-ignore-all lint/nursery/noNestedComponentDefinitions: FIXME */

import { ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { type Column, type Row, useTable } from "react-table";
import type { ThirdwebClient } from "thirdweb";
import { Img } from "@/components/blocks/Img";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToolTipLabel } from "@/components/ui/tooltip";
import type { PublishedContractDetails } from "@/hooks/contract-hooks";
import { replaceDeployerAddress } from "@/lib/publisher-utils";
import { publicIPFSGateway } from "@/lib/sdk";
import { resolveSchemeWithErrorHandler } from "@/utils/resolveSchemeWithErrorHandler";

interface PublishedContractTableProps {
  contractDetails: ContractDataInput[];
  footer?: React.ReactNode;
  publisherEnsName: string | undefined;
  client: ThirdwebClient;
}

type ContractDataInput = PublishedContractDetails;
type ContractDataRow = ContractDataInput["metadata"] & {
  id: string;
};

function convertContractDataToRowData(
  input: ContractDataInput,
): ContractDataRow {
  return {
    id: input.contractId,
    ...input.metadata,
  };
}

export function PublishedContractTable(props: PublishedContractTableProps) {
  const { contractDetails, footer, publisherEnsName } = props;

  const rows = useMemo(
    () => contractDetails.map(convertContractDataToRowData),
    [contractDetails],
  );

  const tableColumns: Column<ContractDataRow>[] = useMemo(() => {
    const cols: Column<ContractDataRow>[] = [
      {
        accessor: (row) => row.logo,
        // biome-ignore lint/suspicious/noExplicitAny: FIXME
        Cell: (cell: any) => (
          <Img
            alt=""
            className="size-8"
            fallback={
              <div className="size-8 rounded-full border border-border bg-muted" />
            }
            src={
              cell.value
                ? resolveSchemeWithErrorHandler({
                    client: props.client,
                    uri: cell.value,
                  })
                : ""
            }
          />
        ),
        Header: "Logo",
      },
      {
        accessor: (row) => row.name,
        // biome-ignore lint/suspicious/noExplicitAny: FIXME
        Cell: (cell: any) => {
          return (
            <Link
              className="whitespace-nowrap text-foreground before:absolute before:inset-0"
              href={replaceDeployerAddress(
                `/${publisherEnsName || cell.row.original.publisher}/${cell.row.original.id}`,
              )}
            >
              {cell.value}
            </Link>
          );
        },
        Header: "Name",
      },
      {
        accessor: (row) => row.description,
        // biome-ignore lint/suspicious/noExplicitAny: FIXME
        Cell: (cell: any) => (
          <span className="line-clamp-2 max-w-[350px] whitespace-normal text-muted-foreground">
            {cell.value}
          </span>
        ),
        Header: "Description",
      },
      {
        accessor: (row) => row.version,
        // biome-ignore lint/suspicious/noExplicitAny: FIXME
        Cell: (cell: any) => (
          <span className="text-muted-foreground">{cell.value}</span>
        ),
        Header: "Version",
      },
      {
        accessor: (row) => ({ audit: row.audit }),
        // biome-ignore lint/suspicious/noExplicitAny: FIXME
        Cell: (cell: any) => (
          <span className="flex items-center gap-2">
            {cell.value.audit ? (
              <ToolTipLabel label="View Contract Audit">
                <Button
                  asChild
                  className="relative z-10 h-auto w-auto p-2"
                  variant="ghost"
                >
                  <Link
                    aria-label="View Contract Audit"
                    href={publicIPFSGateway(cell.value.audit)}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ShieldCheckIcon className="size-5 text-success-text" />
                  </Link>
                </Button>
              </ToolTipLabel>
            ) : null}
          </span>
        ),
        id: "audit-badge",
      },
    ];

    return cols;
  }, [publisherEnsName, props.client]);

  const tableInstance = useTable({
    columns: tableColumns,
    data: rows,
  });

  return (
    <TableContainer>
      <Table {...tableInstance.getTableProps()}>
        <TableHeader>
          {tableInstance.headerGroups.map((headerGroup) => {
            const { key, ...rowProps } = headerGroup.getHeaderGroupProps();
            return (
              <TableRow {...rowProps} key={key}>
                {headerGroup.headers.map((column, columnIndex) => (
                  <TableHead
                    {...column.getHeaderProps()}
                    // biome-ignore lint/suspicious/noArrayIndexKey: FIXME
                    key={columnIndex}
                  >
                    <span className="text-muted-foreground">
                      {column.render("Header")}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            );
          })}
        </TableHeader>

        <TableBody {...tableInstance.getTableBodyProps()} className="relative">
          {tableInstance.rows.map((row) => {
            tableInstance.prepareRow(row);
            return <ContractTableRow key={row.getRowProps().key} row={row} />;
          })}
        </TableBody>
      </Table>
      {footer}
    </TableContainer>
  );
}

function ContractTableRow(props: { row: Row<ContractDataRow> }) {
  const { row } = props;
  const { key, ...rowProps } = row.getRowProps();
  return (
    <TableRow
      className="cursor-pointer hover:bg-card"
      linkBox
      {...rowProps}
      key={key}
    >
      {row.cells.map((cell) => (
        <TableCell {...cell.getCellProps()} key={cell.getCellProps().key}>
          {cell.render("Cell")}
        </TableCell>
      ))}
    </TableRow>
  );
}

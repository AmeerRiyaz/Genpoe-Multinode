
import xlrd 

ExcelFileName= 'Org-Profile.xlsx'
workbook = xlrd.open_workbook(ExcelFileName)

print(f'number of sheets {workbook.nsheets}')

worksheet = workbook.sheet_by_index(1)

#value = worksheet.cell(row, column)

orgName=worksheet.row(4)[2].value
orgDomain=worksheet.row(5)[2].value
orgMSP=worksheet.row(6)[2].value
orderDomainName=worksheet.row(8)[2].value
DcaPort=int(worksheet.row(11)[2].value)
hcaPort=int(worksheet.row(12)[2].value)
peerNo=int(worksheet.row(14)[2].value)

Dport1=int(worksheet.row(17)[2].value)
Dport2=int(worksheet.row(18)[2].value)
print(type(orgName))

x=[21,22,25,26,28,29]
y=2

i=0
j=0
while (i<3):
    hport1=int(worksheet.row(x[j])[y].value)
    j+=1
    hport2=int(worksheet.row(x[j])[y].value)
    j+=1    
    i+=1
    print(f'hport1 {hport1}')
    print(f'hport2 {hport2}')

exit (0)
#### hPort1
hport1=int(worksheet.row(21)[2].value)
hport2=int(worksheet.row(22)[2].value)

#### hport 2
hport3=int(worksheet.row(25)[2].value)
hport4=int(worksheet.row(26)[2].value)

### hport3
hport5=int(worksheet.row(28)[2].value)
hport6=int(worksheet.row(29)[2].value)

print(f'orgName  {orgName}')
print(f'orgDomain  {orgDomain}')
print(f'orgMSP  {orgMSP}')
print(f'orderDomainName  {orderDomainName}')
print(f'Docker port No  {DcaPort}')
print(f'hcaPort  {hcaPort}')
print(f'peerNo  {peerNo}')
print(f'Dport1 {Dport1}')
print(f'Dport1 {Dport2}')

print(f'Dport1 {hport1}')
print(f'Dport1 {hport2}')

print(f'Dport1 {hport3}')
print(f'Dport1 {hport4}')

print(f'Dport1 {hport5}')
print(f'Dport1 {hport6}')
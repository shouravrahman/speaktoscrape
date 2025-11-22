import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId')
  const format = searchParams.get('format') || 'json'
  
  if (!taskId) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
  }

  try {
    const supabase = createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the scraping result
    const { data: result, error } = await supabase
      .from('scraping_results')
      .select(`
        *,
        scraping_tasks!inner(user_id)
      `)
      .eq('task_id', taskId)
      .eq('scraping_tasks.user_id', user.id)
      .single()

    if (error || !result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    let content: string
    let mimeType: string
    let filename: string

    switch (format.toLowerCase()) {
      case 'csv':
        content = convertToCSV(result.data)
        mimeType = 'text/csv'
        filename = `scraping-result-${taskId}.csv`
        break
      
      case 'xml':
        content = convertToXML(result.data)
        mimeType = 'application/xml'
        filename = `scraping-result-${taskId}.xml`
        break
      
      case 'markdown':
        content = convertToMarkdown(result.data)
        mimeType = 'text/markdown'
        filename = `scraping-result-${taskId}.md`
        break
      
      case 'json':
      default:
        content = JSON.stringify(result.data, null, 2)
        mimeType = 'application/json'
        filename = `scraping-result-${taskId}.json`
        break
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Error downloading result:', error)
    return NextResponse.json(
      { error: 'Failed to download result' },
      { status: 500 }
    )
  }
}

function convertToCSV(data: any): string {
  if (!data) return ''
  
  // Handle different data structures
  if (Array.isArray(data)) {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      })
      csvRows.push(values.join(','))
    }
    
    return csvRows.join('\n')
  } else {
    // Single object - convert to single row CSV
    const headers = Object.keys(data)
    const values = headers.map(header => {
      const value = data[header]
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    })
    return [headers.join(','), values.join(',')].join('\n')
  }
}

function convertToXML(data: any): string {
  function objectToXML(obj: any, rootName: string = 'item'): string {
    let xml = `<${rootName}>`
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          xml += `<${key}>`
          for (const item of value) {
            xml += objectToXML(item, 'item')
          }
          xml += `</${key}>`
        } else {
          xml += objectToXML(value, key)
        }
      } else {
        xml += `<${key}>${String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${key}>`
      }
    }
    
    xml += `</${rootName}>`
    return xml
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>'
  
  if (Array.isArray(data)) {
    for (const item of data) {
      xml += objectToXML(item)
    }
  } else {
    xml += objectToXML(data)
  }
  
  xml += '</data>'
  return xml
}

function convertToMarkdown(data: any): string {
  if (!data) return ''
  
  let markdown = '# Scraping Results\n\n'
  
  if (Array.isArray(data)) {
    if (data.length === 0) return markdown + 'No data found.'
    
    // Create table
    const headers = Object.keys(data[0])
    markdown += '| ' + headers.join(' | ') + ' |\n'
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]
        return String(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
      })
      markdown += '| ' + values.join(' | ') + ' |\n'
    }
  } else {
    // Single object
    for (const [key, value] of Object.entries(data)) {
      markdown += `**${key}**: ${value}\n\n`
    }
  }
  
  return markdown
}
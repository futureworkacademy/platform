export function getPdfUtilsScript(): string {
  return `
    function pdfCheckPage(yVal, needed, pageThreshold, topMargin) {
      pageThreshold = pageThreshold || 272;
      topMargin = topMargin || 25;
      if (yVal + needed > pageThreshold) { doc.addPage(); return topMargin; }
      return yVal;
    }

    function pdfSanitizeUnicode(text) {
      if (!text) return '';
      text = text
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/\u2013/g, '-')
        .replace(/\u2014/g, '--')
        .replace(/\u2026/g, '...')
        .replace(/\u00A0/g, ' ')
        .replace(/\u2022/g, '-');
      var out = '';
      for (var si = 0; si < text.length; si++) {
        out += text.charCodeAt(si) > 255 ? '?' : text[si];
      }
      return out;
    }

    function pdfStripMarkdown(text) {
      text = pdfConvertMarkdownTables(text);
      return pdfSanitizeUnicode(text
        .replace(/\`\`\`[\\s\\S]*?\`\`\`/g, '')
        .replace(/__([^_]+)__/g, '**$1**')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/\`([^\`]+)\`/g, '$1')
        .replace(/\\[([^\\]]+)\\]\\([^)]+\\)/g, '$1')
        .replace(/!\\[([^\\]]*)\\]\\([^)]+\\)/g, '')
        .replace(/^>\\s+/gm, '')
        .replace(/\\n{3,}/g, '\\n\\n')
        .trim());
    }

    function pdfConvertLatex(text) {
      var r = text;
      r = r.replace(/\\\\text\\{([^}]*)\\}/g, '$1');
      for (var i = 0; i < 3; i++) {
        r = r.replace(/\\\\frac\\{([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\}\\{([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\}/g, '($1 / $2)');
      }
      r = r.replace(/\\\\sum(?:_\\{[^}]*\\}\\^?\\{?[^}]*\\}?)?/g, 'Σ');
      r = r.replace(/\\\\approx/g, '≈');
      r = r.replace(/\\\\times/g, '×');
      r = r.replace(/\\\\cdot/g, '·');
      r = r.replace(/\\\\div/g, '÷');
      r = r.replace(/\\\\leq/g, '≤');
      r = r.replace(/\\\\geq/g, '≥');
      r = r.replace(/\\\\neq/g, '≠');
      r = r.replace(/\\\\pm/g, '±');
      r = r.replace(/\\\\Rightarrow/g, '⇒');
      r = r.replace(/\\\\rightarrow/g, '→');
      r = r.replace(/\\\\left\\(/g, '(');
      r = r.replace(/\\\\right\\)/g, ')');
      r = r.replace(/\\\\left\\[/g, '[');
      r = r.replace(/\\\\right\\]/g, ']');
      r = r.replace(/\\\\\\[([\\s\\S]*?)\\\\\\]/g, function(_m, inner) {
        var cleaned = inner.trim().replace(/\\s+/g, ' ');
        var parts = cleaned.split(/\\s*=\\s*/);
        if (parts.length > 2) {
          return '\\n    ' + parts[0].trim() + ' = ' + parts[1].trim() + '\\n    = ' + parts.slice(2).join('\\n    = ') + '\\n';
        }
        return '\\n    ' + cleaned + '\\n';
      });
      r = r.replace(/\\\\\\(([\\s\\S]*?)\\\\\\)/g, function(_m, inner) { return inner.trim().replace(/\\s+/g, ' '); });
      r = r.replace(/\\\\\\\$/g, '$');
      r = r.replace(/\\\\ /g, ' ');
      r = r.replace(/_\\{([^}]*)\\}/g, '$1');
      r = r.replace(/\\^\\{([^}]*)\\}/g, '^($1)');
      r = r.replace(/\\\\[a-zA-Z]+/g, '');
      return r;
    }

    function pdfConvertMarkdownTables(text) {
      var lines = text.split('\\n');
      var result = [];
      var i = 0;
      while (i < lines.length) {
        var line = lines[i].trim();
        if (line.charAt(0) === '|' && line.charAt(line.length - 1) === '|' && line.indexOf('|') !== -1) {
          var tableLines = [];
          while (i < lines.length) {
            var tl = lines[i].trim();
            if (tl.charAt(0) === '|' && tl.indexOf('|') !== -1) { tableLines.push(tl); i++; }
            else break;
          }
          var rows = tableLines
            .filter(function(r2) { return !r2.match(/^\\|[\\s\\-:|]+\\|$/); })
            .map(function(r2) { return r2.split('|').slice(1, -1).map(function(c) { return c.replace(/\\*\\*/g, '').trim(); }); });
          if (rows.length === 0) continue;
          var colCount = rows[0].length;
          var colWidths = [];
          for (var c = 0; c < colCount; c++) {
            colWidths[c] = 0;
            for (var rr = 0; rr < rows.length; rr++) {
              if (rows[rr][c] && rows[rr][c].length > colWidths[c]) colWidths[c] = rows[rr][c].length;
            }
            colWidths[c] = Math.min(colWidths[c], 40);
          }
          result.push('');
          for (var rIdx = 0; rIdx < rows.length; rIdx++) {
            var cells = rows[rIdx];
            var formatted = cells.map(function(cell, ci) {
              var w = colWidths[ci] || 10;
              var s = (cell || '').substring(0, w);
              while (s.length < w) s += ' ';
              return s;
            }).join('   ');
            result.push(formatted);
            if (rIdx === 0) {
              var sep = colWidths.map(function(w) { var s2 = ''; for (var x = 0; x < w; x++) s2 += '-'; return s2; }).join('   ');
              result.push(sep);
            }
          }
          result.push('');
        } else {
          result.push(lines[i]);
          i++;
        }
      }
      return result.join('\\n');
    }

    function pdfCleanText(text) {
      return pdfConvertLatex(pdfStripMarkdown(text));
    }

    function pdfAddWrappedMarkdown(text, mw, lh, color, marginX, navyColor) {
      doc.setTextColor(color[0], color[1], color[2]);
      var paragraphs = (text || '').split('\\n');
      for (var p = 0; p < paragraphs.length; p++) {
        var para = paragraphs[p];
        if (para.trim() === '') { y += lh * 0.5; continue; }

        var headerMatch = para.match(/^(#{1,6})\\s+(.*)$/);
        if (headerMatch) {
          var level = headerMatch[1].length;
          var headerText = headerMatch[2].replace(/\\*\\*([^*]+)\\*\\*/g, '$1');
          y = pdfCheckPage(y, lh * 5);
          y += lh * 0.5;
          doc.setFont('helvetica', 'bold');
          if (level <= 2) { doc.setFontSize(12); } else { doc.setFontSize(11); }
          doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
          var hLines = doc.splitTextToSize(headerText, mw);
          for (var hi = 0; hi < hLines.length; hi++) {
            y = pdfCheckPage(y, lh);
            doc.text(hLines[hi], marginX, y);
            y += lh;
          }
          y += lh * 0.3;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(color[0], color[1], color[2]);
          continue;
        }

        var isDivider = para.match(/^[-]{3,}$/) || para.match(/^\\*{3,}$/) || para.match(/^_{3,}$/);
        if (isDivider) {
          y = pdfCheckPage(y, lh);
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(marginX, y - 1, marginX + mw * 0.8, y - 1);
          y += lh * 0.3;
          continue;
        }

        var isFormula = para.match(/^\\s{2,}/) && para.match(/[=≈Σ≤≥≠±→÷·×]/) && !para.match(/^\\s*[-*+]\\s/);
        if (isFormula) {
          var savedF = doc.getFont();
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          var formulaText = para.trim().replace(/\\s+/g, ' ');
          var fLines = doc.splitTextToSize(formulaText, mw - 16);
          var fBlockH = fLines.length * (lh * 0.95) + 4;
          y += lh * 0.3;
          y = pdfCheckPage(y, fBlockH + lh);
          doc.setFillColor(245, 247, 250);
          doc.roundedRect(marginX + 2, y - 3, mw - 4, fBlockH, 1, 1, 'F');
          for (var fi = 0; fi < fLines.length; fi++) {
            doc.text(fLines[fi], marginX + 8, y);
            y += lh * 0.95;
          }
          y += lh * 0.3;
          doc.setFont(savedF.fontName, savedF.fontStyle);
          doc.setFontSize(10);
          continue;
        }

        var isTableRow = para.match(/^\\s*\\S+.*\\s{3,}/) && !para.match(/^\\s*[-*]/);
        if (isTableRow) {
          var savedFont = doc.getFont();
          doc.setFont('courier', savedFont.fontStyle);
          doc.setFontSize(8.5);
          y = pdfCheckPage(y, lh);
          var tableLine = para.length > 95 ? para.substring(0, 95) : para;
          doc.text(tableLine, marginX, y);
          y += lh * 0.85;
          doc.setFont(savedFont.fontName, savedFont.fontStyle);
          doc.setFontSize(10);
          continue;
        }

        var bulletMatch = para.match(/^(\\s*[-*+])\\s+(.*)$/);
        if (bulletMatch) {
          var bulletText = bulletMatch[2];
          var bulletIndent = marginX + 7;
          var bulletW = mw - 10;
          y = pdfCheckPage(y, lh);
          doc.text('•', marginX + 2, y);
          if (bulletText.indexOf('**') !== -1) {
            var bSegs = [];
            var bPts = bulletText.split(/(\\*\\*[^*]+\\*\\*)/);
            for (var bsi = 0; bsi < bPts.length; bsi++) {
              if (bPts[bsi].substring(0, 2) === '**' && bPts[bsi].substring(bPts[bsi].length - 2) === '**') {
                bSegs.push({ t: bPts[bsi].substring(2, bPts[bsi].length - 2), b: true });
              } else if (bPts[bsi].length > 0) {
                bSegs.push({ t: bPts[bsi], b: false });
              }
            }
            var bRLines = []; var bCurLine = []; var bCurW = 0;
            for (var bsi2 = 0; bsi2 < bSegs.length; bsi2++) {
              var bSg = bSegs[bsi2];
              doc.setFont('helvetica', bSg.b ? 'bold' : 'normal');
              var bWords = bSg.t.split(/( +)/);
              for (var bwi = 0; bwi < bWords.length; bwi++) {
                var bWord = bWords[bwi];
                if (bWord === '') continue;
                var bWw = doc.getTextWidth(bWord);
                if (bCurW + bWw > bulletW && bCurLine.length > 0) { bRLines.push(bCurLine); bCurLine = []; bCurW = 0; if (bWord.trim() === '') continue; }
                bCurLine.push({ t: bWord, b: bSg.b }); bCurW += bWw;
              }
            }
            if (bCurLine.length > 0) bRLines.push(bCurLine);
            for (var brli = 0; brli < bRLines.length; brli++) {
              y = pdfCheckPage(y, lh);
              var bxp = bulletIndent;
              for (var bci = 0; bci < bRLines[brli].length; bci++) {
                var bChunk = bRLines[brli][bci];
                doc.setFont('helvetica', bChunk.b ? 'bold' : 'normal');
                doc.text(bChunk.t, bxp, y); bxp += doc.getTextWidth(bChunk.t);
              }
              y += lh;
            }
            doc.setFont('helvetica', 'normal');
          } else {
            var bLines = doc.splitTextToSize(bulletText, bulletW);
            for (var bi = 0; bi < bLines.length; bi++) {
              y = pdfCheckPage(y, lh);
              doc.text(bLines[bi], bulletIndent, y);
              y += lh;
            }
          }
          continue;
        }

        var numberedMatch = para.match(/^(\\d+)\\.\\s+(.*)$/);
        if (numberedMatch) {
          var numText = numberedMatch[2];
          var numIndent = marginX + 9;
          var numW = mw - 12;
          y = pdfCheckPage(y, lh);
          doc.setFont('helvetica', 'bold');
          doc.text(numberedMatch[1] + '.', marginX + 2, y);
          doc.setFont('helvetica', 'normal');
          if (numText.indexOf('**') !== -1) {
            var nSegs = [];
            var nPts = numText.split(/(\\*\\*[^*]+\\*\\*)/);
            for (var nsi = 0; nsi < nPts.length; nsi++) {
              if (nPts[nsi].substring(0, 2) === '**' && nPts[nsi].substring(nPts[nsi].length - 2) === '**') {
                nSegs.push({ t: nPts[nsi].substring(2, nPts[nsi].length - 2), b: true });
              } else if (nPts[nsi].length > 0) {
                nSegs.push({ t: nPts[nsi], b: false });
              }
            }
            var nRLines = []; var nCurLine = []; var nCurW = 0;
            for (var nsi2 = 0; nsi2 < nSegs.length; nsi2++) {
              var nSg = nSegs[nsi2];
              doc.setFont('helvetica', nSg.b ? 'bold' : 'normal');
              var nWords = nSg.t.split(/( +)/);
              for (var nwi = 0; nwi < nWords.length; nwi++) {
                var nWord = nWords[nwi];
                if (nWord === '') continue;
                var nWw = doc.getTextWidth(nWord);
                if (nCurW + nWw > numW && nCurLine.length > 0) { nRLines.push(nCurLine); nCurLine = []; nCurW = 0; if (nWord.trim() === '') continue; }
                nCurLine.push({ t: nWord, b: nSg.b }); nCurW += nWw;
              }
            }
            if (nCurLine.length > 0) nRLines.push(nCurLine);
            for (var nrli = 0; nrli < nRLines.length; nrli++) {
              y = pdfCheckPage(y, lh);
              var nxp = numIndent;
              for (var nci = 0; nci < nRLines[nrli].length; nci++) {
                var nChunk = nRLines[nrli][nci];
                doc.setFont('helvetica', nChunk.b ? 'bold' : 'normal');
                doc.text(nChunk.t, nxp, y); nxp += doc.getTextWidth(nChunk.t);
              }
              y += lh;
            }
            doc.setFont('helvetica', 'normal');
          } else {
            var nLines = doc.splitTextToSize(numText, numW);
            for (var ni = 0; ni < nLines.length; ni++) {
              y = pdfCheckPage(y, lh);
              doc.text(nLines[ni], numIndent, y);
              y += lh;
            }
          }
          continue;
        }

        var hasBold = para.indexOf('**') !== -1;
        if (hasBold) {
          var segs = [];
          var pts = para.split(/(\\*\\*[^*]+\\*\\*)/);
          for (var si = 0; si < pts.length; si++) {
            if (pts[si].substring(0, 2) === '**' && pts[si].substring(pts[si].length - 2) === '**') {
              segs.push({ t: pts[si].substring(2, pts[si].length - 2), b: true });
            } else if (pts[si].length > 0) {
              segs.push({ t: pts[si], b: false });
            }
          }
          var renderLines = [];
          var curLine = [];
          var curLineW = 0;
          for (var si2 = 0; si2 < segs.length; si2++) {
            var sg2 = segs[si2];
            doc.setFont('helvetica', sg2.b ? 'bold' : 'normal');
            var words = sg2.t.split(/( +)/);
            for (var wi = 0; wi < words.length; wi++) {
              var word = words[wi];
              if (word === '') continue;
              var ww = doc.getTextWidth(word);
              if (curLineW + ww > mw && curLine.length > 0) {
                renderLines.push(curLine);
                curLine = [];
                curLineW = 0;
                if (word.trim() === '') continue;
              }
              curLine.push({ t: word, b: sg2.b });
              curLineW += ww;
            }
          }
          if (curLine.length > 0) renderLines.push(curLine);
          for (var rli = 0; rli < renderLines.length; rli++) {
            y = pdfCheckPage(y, lh);
            var xp = marginX;
            for (var ci = 0; ci < renderLines[rli].length; ci++) {
              var chunk = renderLines[rli][ci];
              doc.setFont('helvetica', chunk.b ? 'bold' : 'normal');
              doc.text(chunk.t, xp, y);
              xp += doc.getTextWidth(chunk.t);
            }
            y += lh;
          }
          doc.setFont('helvetica', 'normal');
          continue;
        }

        var lines = doc.splitTextToSize(para, mw);
        for (var li = 0; li < lines.length; li++) {
          y = pdfCheckPage(y, lh);
          doc.text(lines[li], marginX, y);
          y += lh;
        }
      }
    }
  `;
}

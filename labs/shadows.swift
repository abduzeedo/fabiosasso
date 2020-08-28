import SwiftUI
import PlaygroundSupport
struct Screen : View{
    @State var initial = false
    static let lightStart = Color(red: 30 / 255, green: 34 / 255, blue: 46 / 255)
    var body: some View {
        GeometryReader{ geometry in
            ZStack{
                HStack(spacing: (geometry.size.width / 11)){
                    ForEach(0 ..< 12){_ in 
                        Rectangle().frame(width: 1, height: geometry.size.height).opacity(0.05)
                    }
                }.frame(width:geometry.size.width)
                ZStack{
                    Circle().frame(width: geometry.size.width / 3).shadow(color: Color.black, radius: self.initial ? 2 : 2, x: 0, y: self.initial ? 2 : 0)
                        .shadow(color: Color.black, radius: self.initial ? 4 : 0, x: self.initial ? 8 : 0, y: self.initial ? 4 : 0)
                        .shadow(color: Color.black, radius: self.initial ? 8 : 0, x: self.initial ? 16 : 0, y: self.initial ? 8 : 0)
                        .shadow(color: Color.black, radius: self.initial ? 12 : 0, x: self.initial ? 24 : 0, y: self.initial ? 12 : 0)
                        .shadow(color: Color.black, radius: self.initial ? 24 : 0, x: 0, y: self.initial ? 24 : 0)
                        .shadow(color: Color.black, radius: self.initial ? 32 : 0, x: self.initial ? -32 : 0, y: self.initial ? 32 : 0)
                        .shadow(color: Color.black, radius: self.initial ? 48 : 0, x: self.initial ? 48 : 0, y: self.initial ? 48 : 0)
                        .shadow(color: Color.black, radius: self.initial ? 72 : 0, x: self.initial ? -64 : 0, y: self.initial ? 72 : 0).foregroundColor(.black)
                        .animation(.easeIn(duration: 2))
                }
                
                Circle().frame(width: geometry.size.width / 3).foregroundColor(.black).onTapGesture {
                    self.initial.toggle()
                }
                
                HStack{
                    VStack(alignment: .leading){
                        Text("swiftUI").font(.system(size: 56)).fontWeight(.bold).padding(.top,56)
                        Text("shadows").font(.system(size: 56)).fontWeight(.bold).padding(.top,-8)
                        Text("animating \nmultiple \nshadows\nto a view").font(.body).fontWeight(.medium).padding(.top,8)
                        Spacer()
                    }.padding(.leading,geometry.size.width / 11)
                    Spacer()
                }
                
            }
        }
    }
}

PlaygroundPage.current.setLiveView(Screen())

